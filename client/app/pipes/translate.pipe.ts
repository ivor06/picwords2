import {Pipe, PipeTransform} from "@angular/core";
import {Subject} from "rxjs/Subject";

import {I18nService} from "../services/i18n.service";
import {LANG_LIST} from "../../../common/config";
import {MapHashString} from "../../../common/interfaces";

const langList = LANG_LIST;

const localizations = new Map<string, MapHashString>();

@Pipe({name: "translate"})

export class TranslatePipe implements PipeTransform {

    static instantSubject: Subject<TranslatePipe> = new Subject();

    constructor(private i18nService: I18nService) {
        TranslatePipe.instantSubject.next(this);
    }

    transform(value: string, scope: string, language: string): string {
        return localizations && localizations.get(scope) ? localizations.get(scope).get(language)[value] : "";
    }

    setLocalization(scope: string) {
        return this.i18nService.getLocalizations(scope, langList).then(
            localMap => localizations.set(scope, localMap),
            error => console.log.bind(console)
        );
    }
}
