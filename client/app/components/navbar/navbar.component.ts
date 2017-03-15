import {Component, OnInit, ElementRef} from "@angular/core";
import {Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";

import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {UserType} from "../../../../common/classes/user";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {MessageService} from "../../services/message.service";

@Component({
    moduleId: module.id,
    selector: "navbar",
    templateUrl: "navbar.component.html",
    styleUrls: ["navbar.component.css"]
})

export class NavBarComponent extends TranslateMixin implements OnInit {

    private user: UserType = null;
    private userName: string = null;
    private avatar: string = null;
    private isGameProcessing = true;
    private isXs: boolean;
    private isMenuExpand = false;

    constructor(private router: Router,
                private element: ElementRef,
                private _userService: UserService,
                private _messageService: MessageService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
    }

    ngOnInit() {
        Observable.fromEvent(this.element.nativeElement.childNodes[0], "click")
            .filter((event: Event) => (event.target["className"].indexOf("start-game") !== -1) && !this.isGameProcessing)
            .subscribe(() => this._messageService.startGame());

        this._broadcastMessageEvent.on("xs-mode")
            .subscribe(isXs => this.isXs = isXs);

        this._broadcastMessageEvent.on("set-user")
            .subscribe((user: UserType) => {
                this.user = user;
                if (!user.local && !user.vk)
                    this.userName = this.avatar = this.userName = null;
                else if ((user.vk && user.vk.photo_50)) {
                    this.userName = user.vk.nickname ? user.vk.nickname : user.vk.first_name + " " + user.vk.last_name;
                    this.avatar = user.vk.photo_50;
                } else if (user.local) {
                    this.userName = user.local.name;
                    this.avatar = user.local.avatar ? user.local.avatar : null;
                }
            });

        this._broadcastMessageEvent.on("message")
            .filter(message => message.isStopped || message.isStarted)
            .subscribe(message => this.isGameProcessing = !message.isStopped);
    }

    onToggle() {
        this.isMenuExpand = !this.isMenuExpand;
    }

    onVkAuth() {
        this._userService.signInVk()
            .then(() => this.router.navigate(["profile"]))
            .catch(error => console.error("userService.onVkAuth error:", error));
    }

    onLogout() {
        this._userService.logout();
    }
}
