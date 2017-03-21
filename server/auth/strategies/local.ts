import * as LocalStrategy from "passport-local";
import * as BearerStrategy from "passport-http-bearer";
import * as jwt from "jsonwebtoken";
import {Request} from '~express/lib/request';
import {ParsedAsJson} from 'body-parser';

import {ProfileLocal} from "../../../common/classes/user";
import {Email} from "../../../common/classes/email";
import {AUTH} from "../../config/config";
import {filterObjectKeys, rejectedPromise} from "../../../common/util";
import {HttpError} from "../../../common/classes/error";
import {
    findByEmail,
    updateProfile,
    findOrCreateByProfile,
    passwordToHashSync,
    generatePassword,
    validateSync,
    cleanUser
} from "../../providers/user";
import {sendEmail} from "../../providers/email";

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
                user ? null : new HttpError(403, "Forbidden", "User registered already"),
                filterObjectKeys(cleanUser(user || {}, []), AUTH.COMMON_FIELD_LIST.concat(["local"]))),
            error => cb(new HttpError(500, "Server error", "Internal server error")));
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
    localRecoveryPassword = (req, res): Promise<boolean|HttpError> => {
        const
            email = req.body.email,
            isValid = Email.validate(email),
            newPassword = generatePassword();
        if (!isValid)
            return rejectedPromise(new HttpError(403, "Bad Request", "Valid email required"));
        console.log("new password for email", email + ":", newPassword);
        return findByEmail(email)
            .then(user => {
                if (!user)
                    return rejectedPromise(new HttpError(404, "Not Found", "User not found"));
                // user.local.password = passwordToHashSync(newPassword);
                return sendEmail({
                    to: email,
                    subject: "password recovery from picwords.ru",
                    text: "Your new password for picwords.ru is: " + newPassword,
                    html: "<p>Your new password for picwords.ru is: <strong>" + newPassword + "</strong></p>"
                })
                    .then(sentMessageInfo => {
                        console.log("sentMessageInfo:", sentMessageInfo);
                        return updateProfile(new ProfileLocal(user.local));
                    });
            });
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
    localBearerStrategy,
    localRecoveryPassword
}
