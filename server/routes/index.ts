import * as express from "express";

import {localRegister, localLogin, localToken} from "../auth/auth.config";

const router = express.Router();

export {router}

router.get("/user", function (req, res, next) {
    res.send(req.params);
});

router.get("/secret",
    localToken(),
    (req, res) => res.send(req.params));

router.post("/register",
    localRegister(),
    (req, res) => res.send(req.user));

router.post("/login",
    localLogin(),
    (req, res) => res.send(req.user));

router.get("/login/token",
    localToken(),
    (req, res) => res.send(req.user));

router.get('/logout',
    (req, res) => req.logout().then(data => {
        console.log("logout data:", data);
        res.send({result: data});
    }));
