import {Pipe, PipeTransform} from "@angular/core";
import {Subject} from "rxjs/Subject";

import {I18nService} from "../services/i18n.service";
import {LANG_LIST} from "../../../common/config";
import {MapHashString} from "../../../common/interfaces";

const langList = LANG_LIST;

const
    localizations = new Map<string, MapHashString>(),
    getTranslation = (value: string, scope: string, language: string): string => (localizations && localizations.get(scope) && localizations.get(scope).get(language))
        ? localizations.get(scope).get(language)[value]
        : value;

@Pipe({
    name: "translate"
    // , pure: false TODO try
})

export class TranslatePipe implements PipeTransform {

    static instantSubject: Subject<TranslatePipe> = new Subject();

    constructor(private i18nService: I18nService) {
        TranslatePipe.instantSubject.next(this);
    }

    static getTranslation(value: string, scope: string, language: string): string {
        return getTranslation(value, scope, language);
    }

    transform(value: string, scope: string, language: string): string {
        return getTranslation(value, scope, language);
    }

    setLocalization(scope: string) {
        return this.i18nService.getLocalizations(scope, langList).then(
            localMap => localizations.set(scope, localMap),
            error => console.log.bind(console)
        );
    }
}
