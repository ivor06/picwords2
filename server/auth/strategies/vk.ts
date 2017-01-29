// TODO Manually fixed crypto-js/index.d.ts
import * as BearerStrategy from "passport-http-bearer";
import * as https from "https";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import _Strategy = require('~passport~passport-strategy');

import {HttpError} from "../../../common/error";
import {UserType, ProfileVk, ProfileVkType, ErrorOnGetAccessTokenVk} from "../../../common/classes/user";
import {HashObject} from "../../../common/interfaces";
import {AUTH} from "../../../common/config";
import {findOrCreateByProfile, generateHash, findByToken, unsetToken, cleanUser} from "../../providers/user";
import {TYPES, filterObjectKeys} from "../../../common/util";

const
    hashTokens: HashObject<ReplaySubject<UserType|HttpError>> = {},
    hashIds: HashObject<string> = {},
    vkLogin = (req, res) => generateHash(Date.now().toString()).then(hash => {
        const
            getShortHash = (_hash => {
                let sh = _hash.substring(7, 15).replace(/\/|\\|&|\$|=|\?/g, "");
                return sh in hashTokens ? getShortHash(_hash + "_") : sh; // TODO check generate hash again with the same payload
            }),
            shortHash = getShortHash(hash),
            userAgent = req.headers["user-agent"],
            mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(userAgent);
        hashIds[shortHash] = req.params.id;
        res.json({
            oauthUrl: AUTH.VK.OAUTH_URL_AUTHORIZE,
            redirect_uri: AUTH.VK.AUTH_CALLBACK,
            client_id: AUTH.VK.APP_ID,
            state: shortHash,
            display: mobile ? "touch" : "popup",
            response_type: "code",
            v: AUTH.VK.API.VERSION
        });
    }),
    vkLoginCallback = function (req, res) {
        const state = req.query.state;
        res.status(200).end(); // reply on Vk service request
        if (!req.query.code || !state)
            return hashTokens[state] = Observable.create(observer => observer.error(new HttpError(400, "Bad request", "User code and state required"))); // TODO more simple
        const options = {
            hostname: AUTH.VK.OAUTH_URL,
            port: 443,
            path: "/access_token?client_id=" + AUTH.VK.APP_ID
            + "&client_secret=" + AUTH.VK.SECRET_KEY
            + "&redirect_uri=" + AUTH.VK.AUTH_CALLBACK
            + "&code=" + req.query.code
            + "&v=" + AUTH.VK.API.VERSION
        };
        hashTokens[state] = new ReplaySubject(1); // TODO After a time need remove this Subject to prevent memory leaks;
        https.get(options, response => {
            response.on("data", data => {
                let parsedData: ProfileVk|ErrorOnGetAccessTokenVk,
                    profileVk: ProfileVk;
                try {
                    parsedData = JSON.parse(data);
                }
                catch (e) {
                    return hashTokens[state].error(new HttpError(500, "Service unavailable", "VK service error"));
                }
                profileVk = new ProfileVk(parsedData as ProfileVk);
                if (!profileVk["user_id"] || !profileVk.access_token)
                    return hashTokens[state].error(new HttpError(503, "Internal server error", "VK oauth hasn't sent access token: " + (parsedData as ErrorOnGetAccessTokenVk).error_description));
                profileVk.id = profileVk["user_id"];
                delete profileVk["user_id"];
                const options = {
                    hostname: AUTH.VK.API_URL,
                    port: 443,
                    path: AUTH.VK.API.GET_USERS +
                    "v=" + AUTH.VK.API.VERSION +
                    "&access_token=" + profileVk.access_token +
                    "&ids=" + profileVk["user_id"] +
                    "&fields=" + AUTH.VK.USER_FIELD_LIST.join(",")
                };
                https.get(options, response => {
                    response.on("data", data => {
                        let parsedData: ProfileVkType|ErrorOnGetAccessTokenVk;
                        try {
                            parsedData = JSON.parse(data).response[0];
                        }
                        catch (e) {
                            return hashTokens[state].error(new HttpError(500, "Service unavailable", "VK service error"));
                        }
                        if ((parsedData as ProfileVkType).id) {
                            Object.assign(profileVk, parsedData as ProfileVk);
                            req.query = {id: hashIds[state]};
                            findOrCreateByProfile(profileVk, req).then(user => {
                                if (user)
                                    hashTokens[state].next(filterObjectKeys(cleanUser(user, []), AUTH.COMMON_FIELD_LIST.concat(["vk"])));
                                else
                                    hashTokens[state].error(new HttpError(500, "Server error", "User register error"));
                                hashTokens[state].complete();
                            });
                        } else {
                            console.error("user profile request error:", data, parsedData);
                            hashTokens[state].error(new HttpError(503, "Service unavailable", "VK service unavailable"));
                        }
                    });
                    response.on("error", error => {
                        console.error("vk.users.get error:", error);
                        hashTokens[state].error(new HttpError(503, "Service unavailable", "VK service unavailable"));
                    });
                });
            });
            response.on("error", error => {
                console.error("access token get error:", error);
                hashTokens[state].error(new HttpError(503, "Service unavailable", "VK service unavailable"));
            });
        }).on("error", error => {
            console.error("htps.get https://oauth.vk.com/access_token? error:", error);
            hashTokens[state].error(new HttpError(503, "Service unavailable", "VK service doesn't reply"));
        });
    },
    vkLoginSendAccessToken = (req, res) => {
        const state = req.query.state;
        if (state && hashTokens[state]) {
            hashTokens[state].subscribe(
                token => {
                    if (typeof token === TYPES.STRING) {
                        return res.json({token: token});
                    }
                    else
                        res.send(token);
                },
                (error: HttpError) => {
                    return res.status(error.status).send(error)
                },
                () => {
                    delete hashTokens[state];
                }
            );
        }
        else
            res.send(new HttpError(500, "Not Found", "Access token not found"));
    },
    vkTokenInit = (token, cb) => {
        return token
            ? findByToken(token, "vk").then(user => cb(user ? null : new HttpError(404, "Not Found", "User not Found"),
            filterObjectKeys(
                cleanUser(user || {}, [AUTH.VK.TOKEN_FIELD]),
                AUTH.COMMON_FIELD_LIST.concat(["vk"])
            )), cb)
            : cb(new HttpError(400, "Bad request", "Token required"));
    },
    vkLogoutInit = (token, cb) => token
        ? findByToken(token, "vk").then(user => unsetToken(token).then(() => cb(null, {id: user.id}), cb), cb)
        : cb(new HttpError(400, "Bad request", "Token required")),
    anyTokenStrategy = new BearerStrategy.Strategy(vkTokenInit),
    vkTokenLogoutStrategy = new BearerStrategy.Strategy(vkLogoutInit);

export {
    anyTokenStrategy,
    vkLogin,
    vkLoginCallback,
    vkLoginSendAccessToken,
    vkTokenLogoutStrategy
}
