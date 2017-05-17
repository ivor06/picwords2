import {Component, OnInit, ChangeDetectorRef, ElementRef} from "@angular/core";
import {Subscription, Observable} from "rxjs";
import "rxjs/add/observable/fromEvent";

import {UserType, UsersByRoom} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {Message, MessageType} from "../../../../common/classes/message";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {MessageService} from "../../services/message.service";
import {removeObjectKeys, isNumber, isEmptyObject, traversalObject} from "../../../../common/util";
import {CLIENT, MESSAGES} from "../../../../common/config";
import {ImageService} from "../../services/image.service";

const MESSAGE_LIST_PADDING = 45;

@Component({
    moduleId: module.id,
    selector: "game",
    templateUrl: "game.component.html",
    styleUrls: ["game.component.css"]
})

export class GameComponent extends TranslateMixin implements OnInit {
    static state = {
        isInited: false,
        isXs: false,
        self: null,
        element: null,
        currentUser: null,
        messageList: [],
        users: {},
        sendMessageHeight: null
    };
    static subscribes = {
        onResize: null,
        xs: null,
        socketId: null,
        messages: null,
        users: null,
        disconnect: null
    };

    currentMessage = "";
    messageList: MessageType[] = [];
    isXs: boolean;
    private currentUser: UserType;
    private socketId: string;
    private _historyMessageList: string[] = [];
    private _users: UsersByRoom = {};
    private _sendMessageHeight: number;
    private nextImage: string;
    private currentImage: string;
    private isShowMiniature = false;
    constructor(private _imageService: ImageService,
                private _messageService: MessageService,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent,
                private element: ElementRef,
                private changeDetectorRef: ChangeDetectorRef) {
        super();

        if (GameComponent.state.isInited) {
            GameComponent.state.isInited = false;
            this.loadState();
            traversalObject(GameComponent.subscribes, subscriber => (subscriber instanceof Subscription) && subscriber.unsubscribe());
        }

        this.currentUser = this._userService.getCurrentUser();
        if (!this.currentUser || !this.currentUser.id)
            this.currentUser = {id: ""};

        if (isEmptyObject(this._users))
            this._userService.getUsersByRoom("room1")
                .subscribe(users => this._users = users);

        this.bindEvents();

        GameComponent.state.isInited = true;

        this._broadcastMessageEvent.emit("progress.start", false);
    }

    ngOnInit() {
        this._sendMessageHeight = document.getElementsByClassName("send-current-message")[0]["offsetHeight"];
        this.check();
    }

    send() {
        let currentMessageText = this.currentMessage.trim();
        if (currentMessageText.length) {
            let currentMessage: Message;
            if (currentMessageText.length > MESSAGES.MAX_LENGTH)
                currentMessage = new Message({
                    text: "Too long message!",
                    className: "message-alert",
                    time: new Date()
                });
            else {
                currentMessage = new Message({
                    userId: this.currentUser.id,
                    text: currentMessageText,
                    className: "message-user-self",
                    time: new Date(),
                    isSending: true
                });
                // TODO Check longest word length
                this._messageService.sendMessage(currentMessageText).then(() => {
                    currentMessage.isSending = false;
                    if (this.element.nativeElement.isConnected)
                        this.changeDetectorRef.detectChanges();
                });
                this._historyMessageList.push(currentMessageText);
            }
            this.messageList.push(currentMessage);
            this.check();
            this.currentMessage = "";
        }
    }

    check() {
        if (this.element.nativeElement.isConnected || this.element.nativeElement.offsetHeight > 0) {
            this.changeDetectorRef.detectChanges();
            let
                messageListHeight: number,
                gameAreaHeight: number;
            try {
                messageListHeight = document.getElementsByClassName("messageList")[0]["offsetHeight"];
                gameAreaHeight = document.getElementsByClassName("game-area")[0]["offsetHeight"];
            } catch (e) {
                return console.error(e);
            }
            if ((messageListHeight - MESSAGE_LIST_PADDING) > (gameAreaHeight - this._sendMessageHeight)) {
                this.messageList.shift();
                if (this._historyMessageList.length)
                    this._historyMessageList.shift();
                setTimeout(() => this.check(), 500);
            }
        }
    }

    showImage(time?: number) {
        this._broadcastMessageEvent.emit("dialog.show", (isNumber(time) ? time : null));
    }

    saveState() {
        GameComponent.state.messageList = this.messageList;
        GameComponent.state.users = this._users;
        GameComponent.state.isXs = this.isXs;
    }

    loadState() {
        this._users = GameComponent.state.users;
        this.isXs = GameComponent.state.isXs;
        this.messageList = GameComponent.state.messageList;
    }

    bindEvents() {
        GameComponent.subscribes.xs = this._broadcastMessageEvent.on("xs-mode")
            .subscribe(isXs => this.isXs = isXs);

        GameComponent.subscribes.onResize = Observable.fromEvent(window, "resize")
            .throttleTime(CLIENT.THROTTLE_TIME)
            .subscribe(() => this.check());

        GameComponent.subscribes.socketId = this._broadcastMessageEvent.on("socket-id")
            .subscribe(socketId => this.socketId = socketId);

        GameComponent.subscribes.users = this._broadcastMessageEvent.on("users-by-room")
            .subscribe(users => this._users = users);

        GameComponent.subscribes.disconnect = this._broadcastMessageEvent.on("user-disconnect")
            .subscribe(socketId => {
                const newUsers = removeObjectKeys(this._users, [socketId]);
                this._users = {};
                if (this.element.nativeElement.isConnected)
                    this.changeDetectorRef.detectChanges();
                this._users = newUsers;
                if (this.element.nativeElement.isConnected)
                    this.changeDetectorRef.detectChanges();
            });

        GameComponent.subscribes.messages = this._broadcastMessageEvent.on("message")
            .subscribe((message: MessageType) => {
                if (isNumber(message.questionNumber))
                    this._imageService.getImageByNumber(message.questionNumber)
                        .subscribe(
                            () => this.nextImage = "./" + CLIENT.IMAGES_PATH + "/" + message.questionNumber + ".jpg",
                            error => this.isShowMiniature = false
                        );
                if (message.answer) {
                    this.currentImage = this.nextImage;
                    if (!this.isShowMiniature)
                        this.isShowMiniature = true;
                    if (this.element.nativeElement.isConnected || this.element.nativeElement.offsetHeight > 0) {
                        this._broadcastMessageEvent.emit("dialog.setContent", {
                            header: this.getTranslation("answer-correct"),
                            text: message.answer,
                            image: this.currentImage
                        });
                        this.showImage(CLIENT.IMAGE_SHOW_TIME);
                    }
                }
                this.messageList.push(message);
                this.check();
            });
    }
}
