import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/of";
import "rxjs/add/observable/throw";

import {User, UserType, UserByRoomType, UsersByRoom, UserRegister, UserSignin} from "../../../common/classes/user";
import {API_URL} from "../../../common/config";
import {HttpError} from "../../../common/error";
import {BroadcastMessageEvent} from "./broadcast-message.event";

@Injectable()
export class UserService {

    private _userList: UserType[];

    private _userByRoomList: UserByRoomType[];

    private _usersByRoom: UsersByRoom;

    private _headers = new Headers({
        "Content-Type": "application/json"
    });

    private _localStorage = window.localStorage;

    constructor(private _http: Http,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        const token = this.getToken();
        if (token) {
            this._headers.append("Authorization", "Bearer " + token);
            this.signInToken();
        }
    }

    getUserList(): Observable<User[]> {
        return Observable.of(this._userList);
    }

    getUsersByRoom(room: string): Observable<UsersByRoom> {
        return Observable.of(this._usersByRoom);
    }

    getUserByRoomList(room: string): Observable<UserByRoomType[]> {
        return Observable.of(this._userByRoomList);
    }

    getUser(id: string): Observable<User> {
        return this._userList[+id] ? Observable.of(this._userList[+id]) : Observable.throw(new HttpError(404, "User not found", "User not found"));
    }

    signUp(user: UserRegister) {
        return this._http.post(API_URL + "/register", user, {headers: this._headers})
            .toPromise()
            .then(response => response.json());
    }

    signInToken() {
        return this._http.get(API_URL + "/login/token", {headers: this._headers})
            .toPromise()
            .then(response => {
                const user = response.json();
                this._broadcastMessageEvent.emit("signin", user.name);
                return user;
            })
            .catch(error => {
                this.setToken(null);
            });
    }

    signIn(user: UserSignin) {
        return this._http.post(API_URL + "/login", user, {headers: this._headers})
            .toPromise()
            .then(response => {
                const user = response.json();
                if (user.token)
                    this.setToken(user.token);
                return user;
            });
    }

    logout() {
        return this._http.post(API_URL + "/logout", {}, {headers: this._headers})
            .toPromise()
            .then(response => response);
    }

    getSecretPage() {
        return this._http.post(API_URL + "/secret", {}, {headers: this._headers})
            .toPromise()
            .then(response => response.json());
    }

    getToken(): string {
        return this._localStorage ? this._localStorage.getItem("token") : null;
    }

    setToken(token: string) {
        if (token !== null) {
            this._localStorage.setItem("token", token);
            this._headers.set("Authorization", "Bearer" + token);
        }
        else {
            this._localStorage.removeItem("token");
            this._headers.delete("Authorization");
        }
    }
}
