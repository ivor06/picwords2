import * as express from "express";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as passport from "passport";
import * as https from "https";

import {connectDb, disconnectDb} from "./providers/db";
import {prepareQuestions} from "./providers/question";
import {HttpError} from "../common/classes/error";
import {SERVER, IS_PRODUCTION} from "./config/config";
import {log} from "./config/log";
import {router} from "./routes/index";
import {routerAuth} from "./routes/auth";
import {MessageController} from "./controllers/message";

export {
    Server
};

const shouldCompress = (req, res) => (req.headers["x-no-compression"]) ? false : compression.filter(req, res);

class Server {
    /**
     *  Bootstrap the application
     *
     *  @class Server
     *  @method bootstrap
     *  @static
     *  @return {Server} Returns Server instance.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    private app: express.Application;
    private server: https.Server;

    /**
     * Constructor
     *
     * @class Server
     * constructor
     */
    constructor() {
        connectDb()
            .then(prepareQuestions)
            .then(() => {

                this.app = express();

                if (IS_PRODUCTION)
                    log.info("------------ PRODUCTION ------------");
                else
                    log.info("------------ DEBUG ------------");

                    this.app.use(compression({filter: shouldCompress}));
                    this.app.use(express.static(SERVER.STATIC));
                this.app.use(bodyParser.json());
                this.app.use(bodyParser.urlencoded({extended: false}));
                this.app.use(passport.initialize());
                this.app.use(passport.session());
                this.app.use("/", router);
                this.app.use("/auth", routerAuth);
                this.app.use(function (req, res) {
                    res.redirect("/");
                });
                this.app.use((req, res, next) => {
                    next(new HttpError(404));
                });
                this.app.use((err) => {
                    log.error("Error:", err);
                });

                const serv = this.app.listen(SERVER.PORT, SERVER.HOST_NAME, () => {
                    log.info("app listening on", serv.address().address + ":" + serv.address().port);
                });

                let messageController = new MessageController();
                messageController.start();
            },
            error => {
                log.error(error);
                disconnectDb();
            });
    }
}
