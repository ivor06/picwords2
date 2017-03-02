import {Component, Output, EventEmitter} from "@angular/core";

import {LANGUAGES} from "../../../../common/config";

@Component({
    moduleId: module.id,
    selector: "select-lang",
    templateUrl: "select-lang.component.html",
    styleUrls: ["select-lang.component.css"]
})

export class SelectLangComponent {

    @Output() static onChangeLanguage = new EventEmitter();

    languages = LANGUAGES;

    isActiveLanguageList = false;

    currentLang: string = navigator.language.substr(0, 2);

    onToggle() {
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
