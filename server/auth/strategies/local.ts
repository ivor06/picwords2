/// <reference path="../../../typings/index.d.ts" />
import * as LocalStrategy from "passport-local";
import * as BearerStrategy from "passport-http-bearer";
import * as jwt from "jsonwebtoken";

import {User} from "../../../common/classes/user";
import {SERVER} from "../../../common/config";
import {HttpError} from "../../../common/error";
import {findByEmail, updateUser, passwordToHashSync, validateSync} from "../../providers/user";

const
    localRegisterInit = function (req, email, password, cb) {
        // console.log("Register. email:", email, "  password:", password);
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        findByEmail(email).then(user => {
            if (user)
                return cb(null, false, {message: "User " + email + " already exists!"});
            const newUser = new User();
            newUser.email = email;
            newUser.password = passwordToHashSync(password);
            newUser.name = req.body.name;
            newUser.userAgentList = [req.headers["user-agent"]];
            newUser.token = jwt.sign({
                email: email,
                password: password
            }, SERVER.JWT_SECRET, {
                algorithm: "HS256"
            });
            if (req.body.avatar) newUser.city = (req.body.avatar);
            if (req.body.about) newUser.city = (req.body.about);
            if (req.body.city) newUser.city = (req.body.city);

            updateUser(newUser).then(response => cb(
                response.result.ok === 1 ? null : new Error("user update error"),
                req.user = Object.assign(newUser, {_id: response.upsertedId._id})), cb);
        }, cb);
    },
    localLoginInit = function (req, email, password, cb) {
        // console.log("Login. email:", email, "  password:", password);
        if (!email || !password)
            return cb(new HttpError(400, "Bad request", "email and password required"));
        findByEmail(email).then(user => cb(null, (!user || !validateSync(password, user.password)) ? false : req.user = user), cb);
    },
    localBearerInit = function (token, cb) {
        console.log("localBearerInit. token:", token, "\nemail, password:", jwt.decode(token));
        if (!token || !jwt.decode(token) || !jwt.decode(token))
            return cb(new HttpError(400, "Bad request", "Token required"));
        findByEmail(jwt.decode(token)["email"]).then(user => cb(null, (!user || !validateSync(jwt.decode(token)["password"], user.password)) ? false : user), cb);
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
