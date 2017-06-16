import "reflect-metadata";

import {LANG_DEFAULT} from "../../../common/config";
import {TranslatePipe} from "./translate.pipe";
import {SelectLangComponent} from "../components/select-lang/select-lang.component";

export class TranslateMixin {

    currentLanguage = LANG_DEFAULT;
    protected scope: string;

    constructor() {
        this.scope = (Reflect as any).getMetadata("annotations", this.constructor)[0].selector; // TODO find annotation instanceof ComponentDecorator
        TranslatePipe.instantSubject
            .subscribe(translatePipe =>
                translatePipe.setLocalization(this.scope)
                    .then(() => this.currentLanguage = navigator.language.substr(0, 2)));
        SelectLangComponent.onChangeLanguage.subscribe(lang => this.currentLanguage = lang);
    }

    getTranslation(name: string, language?: string): string {
        return TranslatePipe.getTranslation(name, this.scope, language ? language : this.currentLanguage);
    }
}
