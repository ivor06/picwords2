import * as passport from "passport";
import {findById} from "../providers/user";
import {
    anyTokenStrategy,
    vkLogin,
    vkLoginCallback,
    vkLoginSendAccessToken,
    vkTokenLogoutStrategy
} from "./strategies/vk"

import {localRegisterStrategy, localLoginStrategy, localBearerStrategy} from "./strategies/local"

export {
    localRegister,
    localLogin,
    localToken,
    vkLogin,
    vkLoginCallback,
    vkLoginSendAccessToken,
    anyToken,
    vkTokenLogout
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
    findById(id).then(user => {
        done(null, user);
    }, done);
});

passport.use("local-register", localRegisterStrategy);
passport.use("local-login", localLoginStrategy);
passport.use("local-token", localBearerStrategy);
passport.use("any-token", anyTokenStrategy);
passport.use("vk-token-logout", vkTokenLogoutStrategy);

function localRegister() {
    return passport.authenticate("local-register");
}

function localLogin() {
    return passport.authenticate("local-login");
}

function localToken() {
    return passport.authenticate("local-token", {session: false});
}

function anyToken() {
    return passport.authenticate("any-token");
}

function vkTokenLogout() {
    return passport.authenticate("vk-token-logout");
}
