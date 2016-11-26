import {Component, Output, EventEmitter} from "@angular/core";

import {LANGUAGES} from "../../../../common/config";

@Component({
    moduleId: module.id,
    selector: "select-lang",
    templateUrl: "select-lang.component.html",
    styleUrls: ["select-lang.component.css"]
})

export class SelectLangComponent {

    langList = LANGUAGES;

    isActiveLanguageList = false;

    currentLang: string = navigator.language;

    @Output() static onChangeLanguage = new EventEmitter();

    onToggle(evt: any) {
        this.isActiveLanguageList = !this.isActiveLanguageList;
    }

    onSelectLanguage(currentLang: string) {
        this.isActiveLanguageList = false;
        if (this.currentLang !== currentLang) {
            this.currentLang = currentLang;
            SelectLangComponent.onChangeLanguage.emit(currentLang);
        }
    }
}
