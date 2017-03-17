import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";

import {API_URL} from "../../../common/config";
import {NewsType} from "../../../common/classes/news";

@Injectable()
export class NewsService {

    private headers = new Headers({
        "Content-Type": "application/json"
    });

    constructor(private _http: Http) {
    }

    getNews(): Observable<NewsType[]> {
        return this._http
            .get(API_URL + "/news/all", {headers: this.headers})
            .map(response => response.json());
    }
}
