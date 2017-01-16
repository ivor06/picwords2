import * as passport from "passport";
import {findById} from "../providers/user";

import {localRegisterStrategy, localLoginStrategy, localBearerStrategy} from "./strategies/local"

export {
    localRegister,
    localLogin,
    localToken
}

passport.serializeUser((user, done) => done(null, user.id ? user.id : user._id));

passport.deserializeUser((id, done) => {
    console.log("passport.deserializeUser. id:", id);
    findById(id).then(user => {
        console.log("passport.deserializeUser. user:", user);
        done(null, user); //carring
    }, done);
});

passport.use("local-register", localRegisterStrategy);
passport.use("local-login", localLoginStrategy);
passport.use("local-token", localBearerStrategy);

function localRegister() {
    return passport.authenticate("local-register");
}

function localLogin() {
    return passport.authenticate("local-login");
}

function localToken() {
    return passport.authenticate("local-token", {session: false});
}
