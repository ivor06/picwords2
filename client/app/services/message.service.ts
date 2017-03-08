import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/of";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/distinctUntilChanged";

import {UserService} from "./user.service";
import {SOCKET_IO_URL} from "../../../common/config";
import {isObject} from "../../../common/util";
import {join} from "../../../common/url";
import {BroadcastMessageEvent} from "./broadcast-message.event";
import {MessageType} from "../../../common/classes/message";

interface Socket {
    on(event: string, callback: (data: any) => void);
    emit(event: string, data: any, cb?: (time: string) => void);
    id: string;
    io: any;
    connected: boolean;
    disconnected: boolean;
    disconnect(close?: boolean);
    remove();
}

declare var io: {
    connect(url: string, opts?: {transports: string[]}): Socket;
    socket: Socket;
    on(target: string, cb: (data: any) => void);
};

@Injectable()
export class MessageService {

    private userId: string;
    private socketId: string;
    private socket: Socket;
    private connection: Promise<string>;

    constructor(private _broadcastMessageEvent: BroadcastMessageEvent,
                private _userService: UserService) {
        this._broadcastMessageEvent.on("set-user")
            .filter(user => user.id !== this.userId)
            .subscribe(user => {
                this.userId = user.id;
                if (isObject(this.connection))
                    this.connection.then(socketId => {
                        this.socket.on("disconnect", (data) => this.connectSocketIO());
                        this.socket.disconnect(true);
                    });
            });
        this.connectSocketIO();
    }

    connectSocketIO() {
        this.connection = new Promise((resolve, reject) => {
            this.userId = this._userService.getCurrentUserId();
            const
                querySocketId = this.socketId ? "?socketId=" + this.socketId : null,
                queryUserId = this.userId ? "?userId=" + this.userId : null,
                queryTimeZone = this.userId ? "?timezone=" + new Date().getTimezoneOffset() : null;
            this.socketId = null;
            this._broadcastMessageEvent.emit("socket-id", this.socketId);

            const path = join(SOCKET_IO_URL, querySocketId, queryUserId, queryTimeZone);

            this.socket = io.connect(path, {transports: ["websocket", "xhr-polling"]}); // 'opening', 'open', 'closing', 'closed'

            this.socket.on("connect", () => {
                this.socketId = this.socket.id || null;
                this._broadcastMessageEvent.emit("socket-id", this.socketId);

                this.socket.on("disconnected", (socketId: string) => this._broadcastMessageEvent.emit("user-disconnect", socketId));

                this.socket.on("userListByRoom", (users: any) => this._broadcastMessageEvent.emit("users-by-room", users));
                resolve(this.socketId);
            });
        });
    }

    startGame(): Promise<Date> {
        return new Promise(resolve => this.socket.emit("start", time => resolve(time)));
    }

    sendMessage(message: string): Promise<Date> {
        return new Promise(resolve => this.socket.emit("message", message, time => resolve(time))); // TODO Timeout
    }

    getMessage(): Observable<MessageType> {
        return Observable.fromEvent(this.socket as any, "message");
    }
}
