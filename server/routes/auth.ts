import * as express from "express";

import {
    localRegister,
    localLogin,
    localToken,
    vkLogin,
    vkloginCallback,
    vkLoginSendAccessToken,
    anyToken,
    vkTokenLogout
} from "../auth/auth.config";

const routerAuth = express.Router();

export {routerAuth}

routerAuth.post("/local/register",
    localRegister(),
    (req, res) => res.json(req.user));

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

routerAuth.post("/vk/login", vkLogin);

routerAuth.get("/vk/callback", vkloginCallback);

routerAuth.get("/vk/get_access_token", vkLoginSendAccessToken);

routerAuth.get("/vk/token",
    anyToken(),
    (req, res) => res.json(req.user));

routerAuth.get("/vk/logout",
    vkTokenLogout(),
    (req, res) => res.end());
