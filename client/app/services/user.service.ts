import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/of";
import "rxjs/add/observable/throw";

import {
    User,
    UserType,
    UserByRoomType,
    UsersByRoom,
    UserSignin
} from "../../../common/classes/user";
import {API_URL} from "../../../common/config";
import {HttpError} from "../../../common/error";
import {BroadcastMessageEvent} from "./broadcast-message.event";
import {VK} from "../../../common/interfaces";
import {traversalObject} from "../../../common/util";

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
        const
            localToken = this.getToken("localToken"),
            vkToken = this.getToken("vkToken");
        if (localToken) {
            this._headers.append("Authorization", "Bearer " + localToken);
            this.signInToken();
        }
        if (vkToken) {
            this._headers.append("Authorization", "Bearer " + vkToken);
            this.signInVkToken();
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

    signUp(profileLocal: UserType) {
        return this._http.post(API_URL + "/register", profileLocal, {headers: this._headers})
            .toPromise()
            .then(response => {
                const user: UserType = response.json();
                if (user && user.local) {
                    this.setToken("localToken", user.local.token);
                }
                this._broadcastMessageEvent.emit("signin/logout", user);
                return user;
            });
    }

    signInToken() {
        return this._http.get(API_URL + "/login/token", {headers: this._headers})
            .toPromise()
            .then(response => {
                const user: UserType = response.json();
                if (user && user.local) {
                    this._broadcastMessageEvent.emit("signin/logout", user);
                }
                return user;
            })
            .catch(error => {
                console.error("signInToken error", error);
            });
    }

    signIn(user: UserSignin) {
        return this._http.post(API_URL + "/login", user, {headers: this._headers})
            .toPromise()
            .then(response => {
                const user: UserType = response.json();
                if (user && user.local) {
                    this.setToken("localToken", user.local.token);
                    this._broadcastMessageEvent.emit("signin/logout", user);
                }
                return user;
            });
    }

    oauthVkRedirect(url: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const
                title = "VK auth",
                windowOuterWidthMin = 550,
                windowOuterWidth = window.outerWidth,
                windowOuterHeight = window.outerHeight,
                popupWidth = windowOuterWidth >= windowOuterWidthMin ? windowOuterWidthMin : windowOuterWidth,
                popupLeft = windowOuterWidth >= windowOuterWidthMin ? (windowOuterWidth - popupWidth) / 2 : 0,
                popupTop = windowOuterWidth >= windowOuterWidthMin ? (windowOuterHeight - popupWidth) / 2 : 0,
                options = "width=" + popupWidth + ", height=" + popupWidth + ",left=" + popupLeft + ",top=" + popupTop + ",title=" + title,
                popup = window.open(url, "_blank", options);
            popup.focus();
            popup.addEventListener("load", () => {
                popup.blur();
                popup.close();
                resolve(true);
            });
        });
    }

    signInVkToken() {
        return this._http.get(API_URL + "/auth/vk/token", {headers: this._headers})
            .toPromise()
            .then(response => {
                const user: UserType = response.json();
                if (user && (user.local || user.vk)) {
                    this._broadcastMessageEvent.emit("signin/logout", user);
                }
                return user;
            })
            .catch(() => {
                this.signInVk();
            });
    }

    signInVk() {
        return this._http.get(API_URL + "/auth/vk", {headers: this._headers})
            .toPromise()
            .then(response => {
                    const urlParts: VK.OauthRedirectPartsUrl = response.json();
                    if (urlParts) {
                        const
                            urlPartsList: string[] = [],
                            state = urlParts.state;
                        traversalObject(urlParts, (value, key) => {
                            if (key !== "oauthUrl")
                                urlPartsList.push("&" + key + "=" + value)
                        });
                        return this.oauthVkRedirect(urlParts.oauthUrl + "?" + urlPartsList.join("").substring(1))
                            .then(() => {
                                return this._http.get(API_URL + "/auth/vk/get_access_token?state=" + state, {headers: this._headers})
                                    .toPromise()
                                    .then(response => {
                                        const user: UserType = response.json();
                                        if (user && user.vk) {
                                            this.setToken("vkToken", user.vk.access_token);
                                            this._broadcastMessageEvent.emit("signin/logout", user);
                                        }
                                        return user;
                                    });
                            });
                    }
                    return urlParts;
                }
            );
    }

    logout() {
        this._http.get(API_URL + "/logout", {headers: this._headers})
            .subscribe(
                () => this.setToken("localToken", null),
                () => {
                    this.setToken("vkToken", null);
                    this._broadcastMessageEvent.emit("signin/logout", null);
                },
                () => {
                    this._broadcastMessageEvent.emit("signin/logout", null);
                }
            );
    }

    getSecretPage() {
        return this._http.get(API_URL + "/secret", {headers: this._headers})
            .toPromise()
            .then(response => response.json());
    }

    getToken(tokenName: string): string {
        return this._localStorage ? this._localStorage.getItem(tokenName) : null;
    }

    setToken(tokenName: string, token: string) {
        if (token !== null) {
            this._localStorage.setItem(tokenName, token);
            this._headers.set("Authorization", "Bearer " + token);
        }
        else {
            this._localStorage.removeItem(tokenName);
            this._headers.delete("Authorization");
        }
    }
}
