/// <reference path="../../../../typings/index.d.ts" />
import {Component} from "@angular/core";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {isNumber, TYPES} from "../../../../common/util";

interface DialogContent {
    header?: string;
    text?: string;
    image?: string;
    buttonList?: DialogButton[];
    isClosable?: boolean;
    isCloseOnClick?: boolean;
    isError?: boolean;
    callBack?: (result?: any) => void;
}

interface DialogButton {
    label?: string;
    action?: string;
    callBack?: (result?: any) => void;
    className?: string;
    iconClassName?: string;
}

@Component({
    moduleId: module.id,
    selector: "dialog-window",
    templateUrl: "dialog-window.component.html",
    styleUrls: ["dialog-window.component.css"]
})

export class DialogWindowComponent extends TranslateMixin {
    private isDisplay = false;
    private isAnimation = false;
    private content: DialogContent = {};
    private isXs: boolean;

    constructor(private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();

        this._broadcastMessageEvent.on("xs-mode")
            .subscribe(isXs => this.isXs = isXs);

        this._broadcastMessageEvent.on("dialog.show")
            .subscribe((time?: number) => {
                this.show();
                if (isNumber(time))
                    setTimeout(this.hide.bind(this), time);
            });

        this._broadcastMessageEvent.on("dialog.setContent")
            .subscribe((content?: DialogContent) => {
                console.log("setContent", content);
                this.setContent(content);
            });
    }

    setContent(content: DialogContent) {
        this.content = content;
        if (typeof content.callBack === TYPES.FUNCTION)
            content.callBack();
    }

    show() {
        this.isDisplay = true;
        setTimeout(() => this.isAnimation = true);
    }

    hide() {
        this.isAnimation = false;
        setTimeout(() => this.isDisplay = false, 300);
    }
}
