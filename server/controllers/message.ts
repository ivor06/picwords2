/// <reference path="../../typings/index.d.ts" />
import * as SIO from "socket.io";
import "rxjs/add/observable/of";
import {fromEvent} from "rxjs/Observable/fromEvent";

import {Message, MessageType} from "../../common/classes/message";
import {UserType, UsersByRoom, Visit} from "../../common/classes/user";
import {MESSAGES} from "../../common/config";
import {TYPES, isEmptyObject} from "../../common/util";
import {findById, updateAchievements, updateVisitList, setOnline} from "../providers/user";
import {GameController} from "./game";

export {
    MessageController
}

const RE_IP = /.+:(\d+\.\d+\.\d+\.\d+)/;

class MessageController {
    static clients = {};

    private io = new (SIO as any)(); // TODO type of SIO
    private game = new GameController();
    private sockets = {};
    private userIds = {};

    constructor() {
        this.game.questionsBus
            .subscribe((message: MessageType) => {
                if (!message.clientId)
                    return this.io.sockets.emit("message", message);
                if (message.isAnswered) {
                    const
                        clientId = message.clientId,
                        userId = this.userIds[clientId],
                        answerTime = message.answerTime;
                    if (!MessageController.clients[clientId].achievements.minTime || (answerTime < MessageController.clients[clientId].achievements.minTime)) {
                        MessageController.clients[clientId].achievements.minTime = answerTime;
                        message.isRecord = true;
                    }
                    MessageController.clients[clientId].achievements.totalScore += message.answerPoints;
                    this.io.sockets.emit("userListByRoom", MessageController.clients);
                    if (userId)
                        updateAchievements(userId, MessageController.clients[clientId].achievements);
                    this.io.sockets.emit("message", message);
                } else if (message.isQuestion && this.sockets[message.clientId])
                    this.sockets[message.clientId].emit("message", message);
                else
                    this.io.sockets.emit("message", message);
            });
    }

    static getUsersByRoom(room?: string): UsersByRoom {
        return MessageController.clients;
    }

    static generateUserName(): string {
        return "player " + Math.floor(Math.random() * 1000);
    }

    onConnect(socket) {
        const
            socketId = socket.id,
            userSocketId = socket.handshake.query.socketId || null,
            userId = socket.handshake.query.userId || null;

        console.log("user connected. socketId:", socketId, "  userSocketId:", userSocketId, "  userId:", userId);

        if (userSocketId && MessageController.clients[userSocketId])
            this.onDisconnect(socketId, "reconnect", userSocketId);

        const resolveUser = new Promise((resolve, reject) => {
            if (userId)
                findById(userId).then(
                    user => {
                        console.log("user found:", user.id);
                        resolve(user);
                    }, reject);
            else
                resolve(null);
            });

        resolveUser.then(
            user => {
                this.setClient(socket, user);

                /* User's start game request */
                socket.on("start", this.game.start.bind(this.game));

                /* User's message */
                socket.on("message", this.onMessage.bind(this, socketId));

                /* User's disconnect */
                socket.on("disconnect", this.onDisconnect.bind(this, socketId));

                if (!this.game.isGameProcessing) {
                    this.game.start();
                    setTimeout(() => {
                        this.game.stop();
                    }, 120000);
                } else
                    this.game.askQuestion(socketId);
            },
            error => {
                console.error(error);
                this.setClient(socket);
            }
        );
    }

    onDisconnect(socketId, reason, clientSocketId?: string) {
        const id = clientSocketId || socketId;
        console.log("user disconnected", id, "  reason:", reason);
        if (this.userIds[socketId] && MessageController.clients[id].visit)
            updateVisitList(this.userIds[socketId], Object.assign(MessageController.clients[id].visit, {disconnectTime: new Date()}));
        delete MessageController.clients[id];
        delete this.sockets[id];
        delete this.userIds[id];
        setOnline(id, false);
        if (isEmptyObject(this.sockets))
            this.game.stop();
        else
            this.io.sockets.emit("disconnected", id);
    }

    onMessage(socketId: string, message: string, callback) {
        if (typeof message !== TYPES.STRING || message.length > MESSAGES.MAX_LENGTH)
            return callback();
        const
            time = new Date(),
            msg = new Message({
                clientId: socketId,
                text: message,
                time: time
            });
        this.sockets[socketId].broadcast.emit("message", msg);
        this.game.answersBus.next(msg);
        callback && callback(time);
    }

    setClient(socket: SIO.Socket&{client: any, conn: any, request: any}, user?: UserType) {
        const socketId = socket.id;
        let name: string,
            visit: Visit = null;
        if (user) {
            this.userIds[socketId] = user.id;
            setOnline(user.id, true);
            if (user.vk)
                name = user.vk.nickname ? user.vk.nickname : user.vk.first_name + " " + user.vk.last_name;
            if (user.local)
                name = user.local.name;

            const matchIp = (socket.client.request.headers['x-forwarded-for'] || socket.client.conn.remoteAddress || socket.conn.remoteAddress || socket.request.connection.remoteAddress || "").match(RE_IP),
                ip = (matchIp && matchIp.length) ? matchIp[1] : null;
            visit = {
                ip: ip,
                userAgent: socket.handshake.headers["user-agent"],
                connectTime: new Date(),
                timezone: socket.handshake.query.timezone
            }
        }

        if (!name)
            name = MessageController.generateUserName();
        MessageController.clients[socketId] = {
            name: name,
            achievements: user
                ? user.achievements
                : {
                totalScore: 0,
                combo: []
            },
            visit: visit
        };

        this.sockets[socketId] = socket;

        this.io.sockets.emit("userListByRoom", MessageController.clients);
    }

    start() {
        fromEvent(this.io, "connection").subscribe(this.onConnect.bind(this));
        this.io.listen(3001);
    }
}
