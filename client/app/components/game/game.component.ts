import {Component, OnInit, ChangeDetectorRef, ElementRef} from "@angular/core";

import {UserType, UsersByRoom} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {Message, MessageType} from "../../../../common/classes/message";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {MessageService} from "../../services/message.service";
import {removeObjectKeys, isNumber, TYPES} from "../../../../common/util";
import {CLIENT, MESSAGES, GAME} from "../../../../common/config";
import {ImageService} from "../../services/image.service";

const MESSAGE_LIST_PADDING = 45;

@Component({
    moduleId: module.id,
    selector: "game",
    templateUrl: "game.component.html",
    styleUrls: ["game.component.css"]
})

export class GameComponent extends TranslateMixin implements OnInit {

    private currentUser: UserType;
    private socketId: string;
    private messageList: MessageType[] = [];
    private currentMessage = "";
    private isXs: boolean;
    private _historyMessageList: string[] = [];
    private _users: UsersByRoom;
    private _sendMessageHeight: number;
    // private currentRoom: string = "room1";
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

        this._broadcastMessageEvent.on("xs-mode")
            .subscribe(isXs => this.isXs = isXs);

        this._broadcastMessageEvent.on("socket-id")
            .subscribe(socketId => this.socketId = socketId);

        this._broadcastMessageEvent.on("users-by-room")
            .subscribe(users => this._users = users);

        this._broadcastMessageEvent.on("user-disconnect")
            .subscribe(socketId => {
                const newUsers = removeObjectKeys(this._users, [socketId]);
                this._users = {};
                if (this.element.nativeElement.isConnected)
                    this.changeDetectorRef.detectChanges();
                this._users = newUsers;
                if (this.element.nativeElement.isConnected)
                    this.changeDetectorRef.detectChanges();
            });

        this._userService.getUsersByRoom("room1")
            .subscribe(users => this._users = users);

        this._messageService.getMessage()
            .subscribe((message: MessageType) => {
                if (isNumber(message.questionNumber))
                    this._imageService.getImageByNumber(message.questionNumber)
                        .subscribe(() => {
                            },
                            error => this.isShowMiniature = false,
                            () => this.nextImage = "./" + CLIENT.IMAGES_PATH + "/" + message.questionNumber + ".jpg"
                        );
                if (message.answer) {
                    this.currentImage = this.nextImage;
                    if (!this.isShowMiniature)
                        this.isShowMiniature = true;
                    this._broadcastMessageEvent.emit("dialog.setContent", {
                        header: this.getTranslation("answer-correct"),
                        text: message.answer,
                        image: this.currentImage,
                        isClosable: true,
                        isCloseOnClick: true
                    });
                    this.showImage(GAME.IMAGE_SHOW_TIME);

                }
                this.messageList.push(message);
                this.check();
            });

        this.currentUser = this._userService.getCurrentUser();
        if (!this.currentUser || !this.currentUser.id)
            this.currentUser = {id: ""};
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
                }, console.log);
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
            if (document.getElementsByClassName("messageList")[0]["offsetHeight"] - MESSAGE_LIST_PADDING > document.getElementsByClassName("game-area")[0]["offsetHeight"] - this._sendMessageHeight) {
                this.messageList.shift();
                if (this._historyMessageList.length)
                    this._historyMessageList.shift();
                this.check();
            }
        }
    }

    showImage(time?: number) {
        this._broadcastMessageEvent.emit("dialog.show", (isNumber(time) ? time : null));
    }

    ngOnInit() {
        this._sendMessageHeight = document.getElementsByClassName("send-current-message")[0]["offsetHeight"];
    }
}
