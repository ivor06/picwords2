import * as express from "express";

import {anyToken} from "../auth/auth.config";

import {findById} from "../providers/user"

const router = express.Router();

export {router}

router.get("/user/:id",
    anyToken(), // TODO 403 Forbidden
    (req, res) => {
        findById(req.params.id).then(
            res.json.bind(res),
            res.send.bind(res)
        );
    });
