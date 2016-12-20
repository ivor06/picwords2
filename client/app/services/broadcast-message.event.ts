// http://blog.lacolaco.net/post/event-broadcasting-in-angular-2/

import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";

import {BroadcastService} from "./broadcast.service";

@Injectable()
export class BroadcastMessageEvent {
    constructor(private broadcastService: BroadcastService) {
    }

    emit(eventName: string, data: any) {
        this.broadcastService.broadcast(BroadcastMessageEvent, eventName, data);
    }

    on(eventName: string): Observable<string> {
        return this.broadcastService.on<string>(BroadcastMessageEvent, eventName);
    }
}
