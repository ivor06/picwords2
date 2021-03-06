import {Component} from "@angular/core";

import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

@Component({
    moduleId: module.id,
    selector: "progress-bar",
    templateUrl: "progress-bar.component.html",
    styleUrls: ["progress-bar.component.css"]
})

export class ProgressBarComponent {

    public isProcessing = false;

    constructor(private _broadcastMessageEvent: BroadcastMessageEvent) {
        this._broadcastMessageEvent.on("progress.start")
            .subscribe(isStart => this.isProcessing = isStart);
    }

    onToggle() {
        this.isProcessing = !this.isProcessing;
    }
}
