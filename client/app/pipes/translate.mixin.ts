import {} from "reflect-metadata";

import {LANG_DEFAULT} from "../../../common/config";
import {TranslatePipe} from "./translate.pipe";
import {SelectLangComponent} from "../components/select-lang/select-lang.component";

export class TranslateMixin {

    protected currentLanguage = LANG_DEFAULT;

    constructor() {
        const selector = (Reflect as any).getMetadata('annotations', this.constructor)[0].selector; // TODO find annotation instanceof ComponentDecorator
        TranslatePipe.instantSubject
            .subscribe(translatePipe =>
                translatePipe.setLocalization(selector)
                .then(() => this.currentLanguage = navigator.language));
        SelectLangComponent.onChangeLanguage.subscribe(lang => this.currentLanguage = lang);
    }
}
