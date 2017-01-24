import * as express from "express";

import {
    localRegister,
    localLogin,
    localToken,
    vkLogin,
    vkloginCallback,
    vkLoginSendAccessToken,
    vkToken
} from "../auth/auth.config";

const router = express.Router();

export {router}

router.get("/secret", // TODO Only for testing!
    localToken(), // TODO 403 Forbidden
    (req, res) => {
        res.json({secret: "123"});
    });

router.post("/register",
    localRegister(),
    (req, res) => res.json(req.user));

router.post("/login",
    localLogin(),
    (req, res) => res.json(req.user));

router.get("/login/token",
    localToken(),
    (req, res) => res.json(req.user));

router.get("/auth/vk", vkLogin);

router.get("/auth/vk/token",
    vkToken(),
    (req, res) => res.json(req.user));

router.get("/auth/vk/callback", vkloginCallback);

router.get("/auth/vk/get_access_token", vkLoginSendAccessToken);

router.get('/logout',
    localToken(),
    (req, res) => {
        req.logout();
        res.end();
    }
);
