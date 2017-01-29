import * as LocalStrategy from "passport-local";
import * as BearerStrategy from "passport-http-bearer";
import * as jwt from "jsonwebtoken";
import {Request} from '~express/lib/request';
import {ParsedAsJson} from 'body-parser';

import {ProfileLocal} from "../../../common/classes/user";
import {AUTH} from "../../../common/config";
import {filterObjectKeys} from "../../../common/util";
import {HttpError} from "../../../common/error";
import {findByEmail, findOrCreateByProfile, passwordToHashSync, validateSync, cleanUser} from "../../providers/user";

const
    localRegisterInit = function (req: Request&ParsedAsJson, email: string, password: string, cb) {
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        const profileLocal = new ProfileLocal({
            name: req.body.name,
            email: email,
            password: passwordToHashSync(password),
            token: jwt.sign({
                email: email,
                password: password
            }, AUTH.LOCAL.JWT_SECRET, {
                algorithm: "HS256"
            })
        });
        if (req.body.avatar) profileLocal.avatar = (req.body.avatar);
        if (req.body.about) profileLocal.about = (req.body.about);
        if (req.body.city) profileLocal.city = (req.body.city);
        findOrCreateByProfile(profileLocal, req).then(
            user => cb(
                user ? null : new HttpError(500, "Server error", "User register error"),
                filterObjectKeys(cleanUser(user || {}, []), AUTH.COMMON_FIELD_LIST.concat(["local"]))),
            error => cb(new HttpError(500, "Server error", error)));
    },
    localLoginInit = function (req, email, password, cb) {
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        findByEmail(email).then(user => cb(
            null,
            (user && validateSync(password, user.local.password))
                ? req.user = filterObjectKeys(cleanUser(user || {}, []), AUTH.COMMON_FIELD_LIST.concat(["local"]))
                : false),
            cb);
    },
    localBearerInit = function (token, cb) {
        if (!token || !jwt.decode(token))
            return cb(new HttpError(401, "Unauthorized", "Token required"));
        findByEmail(jwt.decode(token)["email"]).then(user => cb(
            null,
            (user && validateSync(jwt.decode(token)["password"], user.local.password))
                ? filterObjectKeys(cleanUser(user || {}, [AUTH.LOCAL.TOKEN_FIELD]), AUTH.COMMON_FIELD_LIST.concat(["local"]))
                : false
        ), cb);
    },
    localOptions = {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
    localRegisterStrategy = new LocalStrategy.Strategy(localOptions, localRegisterInit),
    localLoginStrategy = new LocalStrategy.Strategy(localOptions, localLoginInit),
    localBearerStrategy = new BearerStrategy.Strategy(localBearerInit);

export {
    localRegisterStrategy,
    localLoginStrategy,
    localBearerStrategy
}
