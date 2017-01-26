import * as passport from "passport";
import {findById} from "../providers/user";
import {
    anyTokenStrategy,
    vkLogin,
    vkloginCallback,
    vkLoginSendAccessToken,
    vkTokenLogoutStrategy
} from "./strategies/vk"

import {localRegisterStrategy, localLoginStrategy, localBearerStrategy} from "./strategies/local"

export {
    localRegister,
    localLogin,
    localToken,
    vkLogin,
    vkloginCallback,
    vkLoginSendAccessToken,
    anyToken,
    vkTokenLogout
}

passport.serializeUser((user, done) => {
    return done(null, user.id ? user.id : user._id);
});

passport.deserializeUser((id, done) => {
    findById(id).then(user => {
        done(null, Object.assign(user, {id: user._id})); //carring
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
