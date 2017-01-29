import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {UserType} from "../../../../common/classes/user";
import {TranslateMixin} from "../../pipes/translate.mixin";

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

    constructor(private route: ActivatedRoute,
                private router: Router,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
    }

    ngOnInit() {
        this._broadcastMessageEvent.on("set-user")
            .subscribe((user: UserType) => {
                this.user = user;
                if (!user.local && !user.vk) {
                    this.userName = this.avatar = this.userName = null;
                    console.log("navbar after user null", this.user, this.userName, this.avatar);
                } else if ((user.vk && user.vk.photo_50)) {
                    this.userName = user.vk.nickname ? user.vk.nickname : user.vk.first_name + " " + user.vk.last_name;
                    this.avatar = user.vk.photo_50;
                } else if (user.local) {
                    this.userName = user.local.name;
                    this.avatar = user.local.avatar ? user.local.avatar : null;
                }
            });
    }

    onMenuToggle() {
        console.log("onMenuToggle");
    }

    onVkAuth() {
        this._userService.signInVk()
            .then((data) => {
                this.router.navigate(["profile"]);
            })
            .catch(error => {
                console.error("userService.onVkAuth error:", error);
            });
    }

    onLogout() {
        this._userService.logout();
    }
}
