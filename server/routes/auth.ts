import * as express from "express";

import {updateProfile} from "../providers/user"
import {ProfileLocal} from "../../common/classes/user";
import {
    localRegister,
    localLogin,
    localToken,
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

routerAuth.get("/vk/login", vkLogin);

routerAuth.get("/vk/callback", vkLoginCallback);

routerAuth.get("/vk/get_access_token", vkLoginSendAccessToken);

routerAuth.get("/vk/token",
    anyToken(),
    (req, res) => res.json(req.user));

routerAuth.get("/vk/logout",
    vkTokenLogout(),
    (req, res) => res.end());
