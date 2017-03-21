import {Pipe, PipeTransform} from "@angular/core";
import {Subject} from "rxjs/Subject";

import {I18nService} from "../services/i18n.service";
import {LANG_LIST} from "../../../common/config";
import {MapHashString} from "../../../common/interfaces";
import {ReplaySubject} from "rxjs";
import {resolvedPromise} from "../../../common/util";
import {SelectLangComponent} from "../components/select-lang/select-lang.component";

const langList = LANG_LIST;

const
    localizations = new Map<string, MapHashString>(),
    getTranslation = (value: string, scope: string, language: string, useLanguage?: boolean): string => (
    localizations && localizations.get(scope) && localizations.get(scope).get(useLanguage ? language : SelectLangComponent.currentLanguage))
        ? localizations.get(scope).get(useLanguage ? language : SelectLangComponent.currentLanguage)[value]
        : value;

@Pipe({
    name: "translate",
    pure: true
})

export class TranslatePipe implements PipeTransform {

    static instantSubject: Subject<TranslatePipe> = new ReplaySubject();
    static isNextInvoked = false;

    static getTranslation(value: string, scope: string, language?: string): string {
        return getTranslation(value, scope, language);
    }

    constructor(private i18nService: I18nService) {
        if (!TranslatePipe.isNextInvoked) {
            TranslatePipe.isNextInvoked = true;
            TranslatePipe.instantSubject.next(this);
        }
    }

    transform(value: string, scope: string, language: string, useLanguage?: boolean): string {
        return getTranslation(value, scope, language, useLanguage);
    }

    setLocalization(scope: string): Promise<void> {
        return localizations.get(scope)
            ? resolvedPromise(null)
            : this.i18nService.getLocalizations(scope, langList).then(
            localMap => localizations.set(scope, localMap),
            console.error.bind(console)
        );
    }
}
