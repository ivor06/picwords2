import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {UserType} from "../../../../common/classes/user";

@Component({
    moduleId: module.id,
    selector: "navbar",
    templateUrl: "navbar.component.html",
    styleUrls: ["navbar.component.css"]
})

export class NavBarComponent implements OnInit {

    private user: UserType = null;
    private userName: string = null;
    private avatar: string = null;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
    }

    ngOnInit() {
        this._broadcastMessageEvent.on("signin/logout")
            .subscribe((user: UserType) => {
                this.user = user;
                if (user === null) {
                    this.userName = this.avatar = null;
                }
                this.userName = (user.local && user.local.name)
                    ? user.local.name
                    : ((user.vk && user.vk.nickname) ? user.vk.nickname : user.vk.first_name + " " + user.vk.last_name);
                this.avatar = (user.local && user.local.avatar)
                    ? user.local.avatar
                    : ((user.vk && user.vk.photo_50) ? user.vk.photo_50 : null);
            });
    }

    onMenuToggle() {
        console.log("onMenuToggle");
    }

    onVkAuth() {
        this._userService.signInVk()
            .then((data) => {
                this.router.navigate(["/"]);
            })
            .catch(error => {
                console.error("userService.onVkAuth error:", error);
            });
    }

    onLogout() {
        this._userService.logout();
    }

    onGetSecret() { // TODO Only for testing!
        this._userService.getSecretPage()
            .then((data) => {
                console.log("getSecretPage:", data);
                // this.router.navigate(["/"]);
            })
            .catch(error => {
                console.log("getSecretPage error:", error);
            });
    }
}
