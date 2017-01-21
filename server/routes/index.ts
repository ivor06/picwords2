import * as express from "express";

import {localRegister, localLogin, localToken} from "../auth/auth.config";

const router = express.Router();

export {router}

router.get("/secret", // TODO Only for testing!
    localToken(),
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

router.get('/logout',
    localToken(),
    (req, res) => {
        req.logout();
        res.end();
    }
);
