import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/map";

import {API_URL} from "../../../common/config";
import {FeedbackType} from "../../../common/classes/feedback";

@Injectable()
export class FeedbackService {

    private headers = new Headers({
        "Content-Type": "application/json"
    });

    constructor(private _http: Http) {
    }

    getFeedbackAll(): Observable<FeedbackType[]> {
        return this._http
            .get(API_URL + "/feedback/all", {headers: this.headers})
            .map(response => response.json());
    }

    addFeedback(feedback: FeedbackType): Observable<FeedbackType[]> {
        return this._http
            .post(API_URL + "/feedback/add", feedback, {headers: this.headers})
            .map(response => response.json());
    }
}
