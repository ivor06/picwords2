// http://blog.lacolaco.net/post/event-broadcasting-in-angular-2/

import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";

interface BroadcastEvent {
    key: any;
    eventName: string;
    data?: any;
}

@Injectable()
export class BroadcastService {

    private _eventBus: Subject<BroadcastEvent>;

    constructor() {
        this._eventBus = new Subject<BroadcastEvent>();
    }

    broadcast(key: any, eventName: string, data?: any) {
        this._eventBus.next({key, eventName, data});
    }

    on<T>(key: any, eventName: string): Observable<T> {
        return this._eventBus.asObservable()
            .filter(event => (event.key === key) && (event.eventName === eventName))
            .map(event => <T> event.data);
    }
}
