import * as express from "express";

import {findById, cleanUser, findByRoom, findAll} from "../providers/user";
import {findAllNews} from "../providers/news";
import {findAllFeedback, insertFeedback} from "../providers/feedback";

const router = express.Router();

export {router}

router.get("/news/all",
    (req, res) => findAllNews().then(
        res.json.bind(res),
        res.send.bind(res)
    ));

router.get("/feedback/all",
    (req, res) => findAllFeedback().then(
        res.json.bind(res),
        res.send.bind(res)
    ));

router.post("/feedback/add",
    (req, res) => insertFeedback(req.body).then(
        res.json.bind(res),
        res.send.bind(res)
    ));

router.get("/user/id=:id",
    (req, res) => findById(req.params.id).then(
        user => res.json(cleanUser(user)),
        res.send.bind(res)
    ));

router.get("/user/list",
    (req, res) => findAll().then(
        res.json.bind(res),
        res.send.bind(res)
    ));

router.get("/user/room/:name",
    (req, res) => findByRoom(req.params.name).subscribe(
        res.json.bind(res),
        res.send.bind(res)
    ));
