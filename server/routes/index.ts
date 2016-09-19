import * as express from "express";

const router = express.Router();

export {router}

/* Before request processing */
router.use(function timelog(req, res, next) {
    console.log("Time:", Date.now());
    next();
});

/* GET home page. */
router.get("/user", function (req, res, next) {
    res.send(req.params);
});