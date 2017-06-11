import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";

import {HashString, MapHashString} from "../../../common/interfaces";

@Injectable()
export class I18nService {

    getLocalizations(componentName: string, languageList: string[]): Promise<MapHashString> {
        const localizations: MapHashString = new Map<string, HashString>();
        return new Promise(resolve => {
            let i = 0;
            languageList.forEach((language: string) => System.import("../components/" + componentName + "/i18n/" + language + ".json")
                .then(json => {
                    localizations.set(language.substr(0, 2), json);
                    if (++i === languageList.length)
                        resolve(localizations);
                }));
        });
    }
}
