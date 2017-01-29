import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute} from '@angular/router';

import {UserType} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

@Component({
    moduleId: module.id,
    selector: "profile",
    templateUrl: "profile.component.html",
    styleUrls: ["profile.component.css"]
})

export class ProfileComponent extends TranslateMixin implements OnInit {
    private currentUserId: string;
    private user: UserType = {};
    private isLoading = true;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
    }

    ngOnInit() {
        this.currentUserId = this._userService.getCurrentUserId();

        this._broadcastMessageEvent.on("set-user")
            .subscribe((user: UserType) => this.user = user);

        this._route.params.subscribe(params => {
            const id = params["id"];
            if (id && id !== this.currentUserId)
                this._userService.getUser(id)
                    .subscribe(
                        (user) => this.user = user,
                        error => this.isLoading = false,
                        () => this.isLoading = false
                    );
            else if (this.currentUserId) {
                this.user = this._userService.getCurrentUser();
                this.isLoading = false;
            }
        });
    }

    onLogout(profileName: string) {
        this._userService.logout(profileName);
    }

    addProfile(profileName: string) {
        switch (profileName) {
            case "local": {
                this._router.navigate(["signin"]);
                break;
            }
            case "vk": {
                this._userService.signInVk().then(user => this.user = user)
                    .catch(error => console.error("error in userService.signInVk:", error));
                break;
            }
            default: {
                console.error("No such profile name");
            }
        }
    }
}
