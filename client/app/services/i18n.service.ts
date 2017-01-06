import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";

import {HashString, MapHashString} from "../../../common/interfaces";

@Injectable()
export class I18nService {

    constructor(private _http: Http) {
    }

    getLocalizations(componentName: string, languageList: string[]): Promise<MapHashString> {
        const localizations: MapHashString = new Map<string, HashString>();
        return new Promise((resolve, reject) => {
            let i = 0;
            languageList.forEach((language: string) => this._http.get("app/components/" + componentName + "/i18n/" + language + ".json")
                .map((res: any) => res.json())
                .subscribe((data: HashString) => {
                        localizations.set(language.substr(0, 2), data);
                        if (++i === languageList.length)
                            resolve(localizations);
                    },
                    reject));
        });
    }
}
