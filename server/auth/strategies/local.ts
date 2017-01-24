import * as LocalStrategy from "passport-local";
import * as BearerStrategy from "passport-http-bearer";
import * as jwt from "jsonwebtoken";
import {Request} from '~express/lib/request';
import {ParsedAsJson} from 'body-parser';

import {User, ProfileLocal} from "../../../common/classes/user";
import {AUTH} from "../../../common/config";
import {HttpError} from "../../../common/error";
import {findByEmail, findOrCreateByProfile, passwordToHashSync, validateSync} from "../../providers/user";

const
    localRegisterInit = function (req: Request&ParsedAsJson, email: string, password: string, cb) {
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        findByEmail(email).then(user => {
            if (user)
                return cb(null, false, {message: "User " + email + " already exists!"});
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
                id => cb(id ? null : new HttpError(500, "Server error", "User register error"), {
                id: id,
                local: {
                    token: profileLocal.token,
                    name: profileLocal.name,
                    avatar: profileLocal.avatar
                }
                }),
                error => cb(new HttpError(500, "Server error", error)));
        }, cb);
    },
    localLoginInit = function (req, email, password, cb) {
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        findByEmail(email).then(user => cb(null, (user && validateSync(password, user.local.password)) ? req.user = {
            id: user._id,
            local: {
                token: user.local.token,
                name: user.local.name,
                avatar: user.local.avatar
            }
        } : false), cb);
    },
    localBearerInit = function (token, cb) {
        if (!token || !jwt.decode(token))
            return cb(new HttpError(401, "Unauthorized", "Token required"));
        findByEmail(jwt.decode(token)["email"]).then(user => cb(null, (user && validateSync(jwt.decode(token)["password"], user.local.password)) ? {
            id: user._id,
            local: {
                token: user.local.token,
                name: user.local.name,
                avatar: user.local.avatar
            }
        } : false), cb);
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
