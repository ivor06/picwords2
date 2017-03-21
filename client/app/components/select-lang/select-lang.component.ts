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
    static currentLanguage = navigator.language.substr(0, 2);

    private languages = LANGUAGES;
    private isActiveLanguageList = false;

    onToggle() {
        this.isActiveLanguageList = !this.isActiveLanguageList;
    }

    onSelectLanguage(currentLang: string) {
        this.isActiveLanguageList = false;
        if (SelectLangComponent.currentLanguage !== currentLang) {
            SelectLangComponent.currentLanguage = currentLang;
            SelectLangComponent.onChangeLanguage.emit(currentLang);
        }
    }

    getCurrentLanguage(): string {
        return SelectLangComponent.currentLanguage;
    }
}
