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
        this._broadcastMessageEvent.on("signin/logout")
            .subscribe(userName => {
                this.userName = userName;
            });
    }

    onMenuToggle() {
        console.log("onMenuToggle");
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
