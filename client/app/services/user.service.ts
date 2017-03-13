import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/toPromise";
import "rxjs/add/observable/of";
import "rxjs/add/operator/take";
import "rxjs/add/observable/throw";

import {
    UserType,
    UsersByRoom,
    ProfileLocalType
} from "../../../common/classes/user";
import {API_URL, AUTH} from "../../../common/config";
import {BroadcastMessageEvent} from "./broadcast-message.event";
import {VK} from "../../../common/interfaces";
import {traversalObject, promiseSeries, isEmptyObject, rejectedPromise} from "../../../common/util";

@Injectable()
export class UserService {

    private user: UserType = {};

    private _headers = new Headers({
        "Content-Type": "application/json"
    });

    private _localStorage = window.localStorage;

    constructor(private _http: Http,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        const
            localToken = this.getToken("local"),
            vkToken = this.getToken("vk");
        if (localToken)
            this.signInToken();
        if (vkToken)
            this.signInVkToken();
    }

    getUserList(): Observable<UserType[]> {
        return this._http.get(API_URL + "/user/list", {headers: this._headers})
            .map(response => response.json());
    }

    getUsersByRoom(roomName: string): Observable<UsersByRoom> {
        return this._http.get(API_URL + "/user/room/" + roomName, {headers: this._headers})
            .map(response => response.json());
    }

    getUser(id: string): Observable<UserType> {
        if (!id)
            return Observable.of(null);
        return id ? this._http.get(API_URL + "/user/id=" + id)
            .map(response => {
                this.user = response.json();
                this._broadcastMessageEvent.emit("set-user", this.user);
                return this.user;
            }) : null;
    }

    getCurrentUser(): UserType {
        return (this.user && !isEmptyObject(this.user)) ? this.user : null;
    }

    getCurrentUserId(): string {
        return (this.user && !isEmptyObject(this.user)) ? this.user.id : null;
    }

    edit(profileLocal: ProfileLocalType) {
        this.setAuthHeader("local");
        return this._http.post(API_URL + "/auth/local/edit", profileLocal, {headers: this._headers})
            .toPromise()
            .then(() => {
                this.user.local = profileLocal;
                this._broadcastMessageEvent.emit("set-user", this.user);
                return this.user;
            });
    }

    signUp(profileLocal: ProfileLocalType) {
        const url = API_URL + "/auth/local/register" + (this.getCurrentUserId() ? ("/?id=" + this.getCurrentUserId()) : "");
        return this._http.post(url, profileLocal, {headers: this._headers})
            .toPromise()
            .then(response => this.setUser(response.json(), "local", true));
    }

    signInToken() {
        this.setAuthHeader("local");
        return this._http.get(API_URL + "/auth/local/token", {headers: this._headers})
            .toPromise()
            .then(response => this.setUser(response.json(), "local"))
            .catch(() => this.clearProfile("local"));
    }

    signInLocal(profileLocal: ProfileLocalType) {
        const url = API_URL + "/auth/local/login" + (this.getCurrentUserId() ? ("/id=" + this.getCurrentUserId()) : "");
        return this._http.post(url, profileLocal, {headers: this._headers})
            .take(1)
            .toPromise()
            .then(response => this.setUser(response.json(), "local", true));
    }

    forgotPassword(email: string): Promise<boolean> {
        return this._http.post(API_URL + "/auth/local/forgot", {email: email}, {headers: this._headers})
            .toPromise()
            .then(
                response => response.json(),
                error => rejectedPromise(error.json())
            );
    }

    oauthVkRedirect(url: string): Promise<boolean> {
        return new Promise(resolve => {
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
        this.setAuthHeader("vk");
        return this._http.get(API_URL + "/auth/vk/token", {headers: this._headers})
            .toPromise()
            .then(response => this.setUser(response.json(), "vk"))
            .catch(() => this.clearProfile("vk"));
    }

    signInVk() {
        const url = API_URL + "/auth/vk/login" + (this.getCurrentUserId() ? ("/?id=" + this.getCurrentUserId()) : "");
        return this._http.get(url, {headers: this._headers})
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
                            .then(() => this._http.get(API_URL + "/auth/vk/get_access_token?state=" + state, {headers: this._headers})
                                .toPromise()
                                .then(response => this.setUser(response.json(), "vk", true)));
                    }
                return null;
                }
            );
    }

    logout(profileName?: string) {
        promiseSeries((profileName ? [profileName] : AUTH.PROFILE_LIST)
            .filter(name => {
                const token = this.getToken(name);
                if (!token)
                    this.clearProfile(name);
                return !!token;
            })
            .map(name => {
                this.setAuthHeader(name);
                return this._http.get(API_URL + "/auth/" + name + "/logout", {headers: this._headers})
                    .toPromise()
                    .then(
                        () => name,
                        () => name
                    );
            }), this.clearProfile.bind(this));
    }

    setUser(user: UserType, profileName: string, setToken: boolean = false) {
        this.user = this.user ? Object.assign(this.user, user) : user;
        if (setToken && this.user[profileName] && this.user[profileName][AUTH[profileName.toUpperCase()].TOKEN_FIELD]) {
            this.setToken(profileName, this.user[profileName][AUTH[profileName.toUpperCase()].TOKEN_FIELD]);
            delete this.user[profileName][AUTH[profileName.toUpperCase()].TOKEN_FIELD];
        }
        this._broadcastMessageEvent.emit("set-user", this.user);
        return this.user;
    }

    getToken(profileName: string): string {
        return this._localStorage ? this._localStorage.getItem(profileName + "Token") : null;
    }

    setToken(profileName: string, token: string) {
        if (token !== null) {
            this._localStorage.setItem(profileName + "Token", token);
            this.setAuthHeader(profileName);
        }
        else {
            this._localStorage.removeItem(profileName + "Token");
        }
    }

    setAuthHeader(profileName?: string) {
        if (profileName)
            this._headers.set("Authorization", "Bearer " + this.getToken(profileName));
        else
            this._headers.delete("Authorization");
    }

    clearProfile(profileName: string) {
        this.setToken(profileName, null);
        delete this.user[profileName];
        if (AUTH.PROFILE_LIST.every(name => !(this.user[name])))
            this.user = {};
        this._broadcastMessageEvent.emit("set-user", this.user);
    }
}
