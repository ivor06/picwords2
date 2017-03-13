import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/pluck";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/operator/distinctUntilChanged";

import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {CLIENT} from "../../../../common/config";

@Component({
    moduleId: module.id,
    selector: "responsive",
    template: ""
})

export class ResponsiveComponent implements OnInit {
    constructor(private _broadcastMessageEvent: BroadcastMessageEvent) {
    }

    ngOnInit() {
        setTimeout(() => this._broadcastMessageEvent.emit("xs-mode", window.innerWidth < CLIENT.DISPLAY_MODES.SM), 0);
        Observable.fromEvent(window, "resize")
            .pluck("currentTarget", "innerWidth")
            .throttleTime(CLIENT.THROTTLE_TIME)
            .map(width => width <= CLIENT.DISPLAY_MODES.SM)
            .distinctUntilChanged()
            .subscribe((isXs) => this._broadcastMessageEvent.emit("xs-mode", isXs));
    }
}
