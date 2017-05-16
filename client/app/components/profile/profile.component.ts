/// <reference path="../../../../typings/index.d.ts" />
import {Component} from "@angular/core";
import {Router, ActivatedRoute} from '@angular/router';

import {UserType} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {Subscription} from "rxjs";
import {traversalObject} from "../../../../common/util";

@Component({
    moduleId: module.id,
    selector: "profile",
    templateUrl: "profile.component.html",
    styleUrls: ["profile.component.css"]
})

export class ProfileComponent extends TranslateMixin {
    static subscribes = {
        setUser: null,
        route: null
    };

    private currentUserId: string;
    private user: UserType = {};
    private self = true;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();

        traversalObject(ProfileComponent.subscribes, subscriber => (subscriber instanceof Subscription) && subscriber.unsubscribe());

        this.currentUserId = this._userService.getCurrentUserId();

        this.bindEvents();

        this._broadcastMessageEvent.emit("progress.start", false);
    }

    onLogout(profileName: string) {
        this._userService.logout(profileName);
    }

    addProfile(profileName: string) {
        this._broadcastMessageEvent.emit("progress.start", true);
        switch (profileName) {
            case "local": {
                this._router.navigate(["signin"]);
                break;
            }
            case "vk": {
                this._userService.signInVk()
                    .then(user => {
                        this.user = user;
                        this._broadcastMessageEvent.emit("progress.start", false);
                    })
                    .catch(error => this._broadcastMessageEvent.emit("progress.start", false));
                break;
            }
            default: {
                this._broadcastMessageEvent.emit("progress.start", false);
            }
        }
    }

    bindEvents() {
        ProfileComponent.subscribes.setUser = this._broadcastMessageEvent.on("set-user")
            .subscribe((user: UserType) => {
                this.user = user;
                this.currentUserId = this._userService.getCurrentUserId();
            });

        ProfileComponent.subscribes.route = this._route.params.subscribe(params => {
            const id = params["id"];
            if (id && id !== this.currentUserId) {
                this.self = false;
                this._userService.getUser(id)
                    .subscribe(
                        user => this.user = user,
                        error => this._broadcastMessageEvent.emit("progress.start", false),
                        () => this._broadcastMessageEvent.emit("progress.start", false)
                    );
            }
            else {
                this.self = true;
                if (this.currentUserId)
                    this.user = this._userService.getCurrentUser();
                this._broadcastMessageEvent.emit("progress.start", false);
            }
        });
    }
}
