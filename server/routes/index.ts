import * as express from "express";

import {findById, cleanUser, findByRoom} from "../providers/user"

const router = express.Router();

export {router}

router.get("/user/:id",
    (req, res) => {
        findById(req.params.id).then(
            user => res.json(cleanUser(user)),
            res.send.bind(res)
        );
    });

router.get("/user/room/:name",
    (req, res) => findByRoom(req.params.name).subscribe(
        res.json.bind(res),
        res.send.bind(res)
    ));
