import * as express from "express";

import {updateProfile} from "../providers/user"
import {ProfileLocal} from "../../common/classes/user";
import {
    localRegister,
    localLogin,
    localToken,
    localRecoveryPassword,
    vkLogin,
    vkLoginCallback,
    vkLoginSendAccessToken,
    anyToken,
    vkTokenLogout
} from "../auth/auth.config";

const routerAuth = express.Router();

export {routerAuth}

routerAuth.post("/local/register",
    localRegister(),
    (req, res) => res.json(req.user));

routerAuth.post("/local/edit",
    localToken(),
    (req, res) => updateProfile(new ProfileLocal(req.body)).then(
        res.json.bind(res),
        res.send.bind(res)
    ));

routerAuth.post("/local/login",
    localLogin(),
    (req, res) => res.json(req.user));

routerAuth.get("/local/token",
    localToken(),
    (req, res) => res.json(req.user));

routerAuth.get("/local/logout",
    localToken(),
    (req, res) => {
        req.logout();
        res.end();
    }
);

routerAuth.post("/local/forgot",
    (req, res) => localRecoveryPassword(req, res)
        .then(
            res.json.bind(res),
            error => {
                if ((error instanceof Error) || error.code)
                    res.status(error.status || 500);
                res.send(error);
            }
        )
);

routerAuth.get("/vk/login", vkLogin);

routerAuth.get("/vk/callback", vkLoginCallback);

routerAuth.get("/vk/get_access_token", vkLoginSendAccessToken);

routerAuth.get("/vk/token",
    anyToken(),
    (req, res) => res.json(req.user));

routerAuth.get("/vk/logout",
    vkTokenLogout(),
    (req, res) => res.end());
