import {Component} from "@angular/core";

import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {MAIL_TO} from "../../../../common/config";

@Component({
    moduleId: module.id,
    selector: "footer-stick",
    templateUrl: "footer-stick.component.html",
    styleUrls: ["footer-stick.component.css"]
})

export class FooterStickComponent {
    userId: string = null;
    isXs: boolean;
    mailTo = MAIL_TO;

    constructor(private _broadcastMessageEvent: BroadcastMessageEvent) {
        this._broadcastMessageEvent.on("xs-mode")
            .subscribe(isXs => this.isXs = isXs);

        this._broadcastMessageEvent.on("set-user")
            .subscribe(user => this.userId = user.id);
    }
}
