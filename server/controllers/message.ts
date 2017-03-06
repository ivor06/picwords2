/// <reference path="../../typings/index.d.ts" />
import * as SIO from "socket.io";
import "rxjs/add/observable/of";
import {fromEvent} from "rxjs/Observable/fromEvent";

import {Message, MessageType} from "../../common/classes/message";
import {UserType, UsersByRoom} from "../../common/classes/user";
import {MESSAGES} from "../../common/config";
import {TYPES, isEmptyObject} from "../../common/util";
import {findById, updateAchievements} from "../providers/user";
import {GameController} from "./game";

export {
    MessageController
}

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
            userId = socket.handshake.query.userId || null,
            ua = socket.handshake.headers["user-agent"].substring(socket.handshake.headers["user-agent"].lastIndexOf(")") + 1);

        console.log("user connected. socketId:", socketId, "  userSocketId:", userSocketId, "  userId:", userId, ua);

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
                this.setClient(socketId, socket, user);

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
                this.setClient(socketId, socket);
            }
        );
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

    onDisconnect(socketId, reason, clientSocketId?: string) {
        const id = clientSocketId || socketId;
        console.log("user disconnected", id, "  reason:", reason);
        delete MessageController.clients[id];
        delete this.sockets[id];
        delete this.userIds[id];
        if (isEmptyObject(this.sockets)) {
            console.log("nobody in the room");
            this.game.stop();
        } else
            this.io.sockets.emit("disconnected", id);
    }

    setClient(key: string, socket: SIO.Socket, user?: UserType) {
        let name: string;
        if (user) {
            this.userIds[key] = user.id;
            if (user.vk)
                name = user.vk.nickname ? user.vk.nickname : user.vk.first_name + " " + user.vk.last_name;
            if (user.local)
                name = user.local.name;
        }
        if (!name)
            name = MessageController.generateUserName();
        MessageController.clients[key] = {
            name: name,
            achievements: user
                ? user.achievements
                : {
                totalScore: 0,
                combo: []
            }
        };
        this.sockets[key] = socket;

        this.io.sockets.emit("userListByRoom", MessageController.clients);
    }

    start() {
        fromEvent(this.io, "connection").subscribe(this.onConnect.bind(this));
        this.io.listen(3001);
    }
}
