import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";

import {CLIENT} from "../../../common/config";
import {isNumber} from "../../../common/util";

@Injectable()
export class ImageService {

    constructor(private _http: Http) {
    }

    getImageByNumber(number: number, width?: number): Observable<any> {
        return isNumber(number) ? this._http.get("./" + CLIENT.IMAGES_PATH + "/" + number + ".jpg") : Observable.of(null);
    }
}
