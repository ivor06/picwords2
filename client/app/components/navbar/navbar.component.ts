/// <reference path="../../../../typings/index.d.ts" />
import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

@Component({
    moduleId: module.id,
    selector: "navbar",
    templateUrl: "navbar.component.html",
    styleUrls: ["navbar.component.css"]
})

export class NavBarComponent implements OnInit {

    private userName: string = null;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
    }

    ngOnInit() {
        // console.log("navbar currentRoute:", this.route);
        this.route.params.subscribe(currentRoute => {
            // console.log("navbar currentRoute params:", currentRoute);
        });

        this._broadcastMessageEvent.on("signin")
            .subscribe(userName => {
                this.userName = userName;
            });
    }

    // onSignIn() {
    //
    // }

    onMenuToggle() {
        console.log("onMenuToggle");
    }

    onLogout() {
        console.log("onLogout");
        this._userService.logout()
            .then((data) => {
                console.log("http post done. logout:", data);
                this.userName = null;
                this._userService.setToken(null);
                // this.router.navigate(["/"]);
            })
            .catch(error => {
                console.log("error in userService.logout:", error);
            });
    }

    onGetSecret() {
        console.log("onGetSecret");
        this._userService.getSecretPage()
            .then((data) => {
                console.log("http post done. onGetSecret:", data);
                // this.router.navigate(["/"]);
            })
            .catch(error => {
                console.log("error in userService.getSecretPage:", error);
            });
    }
}
