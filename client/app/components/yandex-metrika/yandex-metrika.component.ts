import {Component} from "@angular/core";

import {TranslateMixin} from "../../pipes/translate.mixin";

@Component({
    moduleId: module.id,
    selector: "yandex-metrika",
    templateUrl: "yandex-metrika.component.html",
    styleUrls: ["yandex-metrika.component.css"]
})

export class YandexMetrikaComponent extends TranslateMixin {

    constructor() {
        super();
    }
}
