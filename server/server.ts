import * as express from "express";
import {Express} from "~express/lib/express";
import * as bodyParser from "body-parser";
import * as passport from "passport";
import * as https from "https";

import {connectDb, disconnectDb} from "./providers/db";
import {HttpError} from "../common/classes/error";
import {SERVER, IS_PRODUCTION} from "./config/config";
import {log} from "./config/log";
import {router} from "./routes/index";
import {routerAuth} from "./routes/auth";
import {MessageController} from "./controllers/message";

export {
    Server
};

class Server {
    app: express.Application;
    server: https.Server;
    io: SocketIO.Server;

    /**
     *  Bootstrap the application
     *
     *  @class Server
     *  @method bootstrap
     *  @static
     *  @return {Server} Returns Server instance.
     */
    static  bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor
     *
     * @class Server
     * constructor
     */
    constructor() {
        connectDb().then(
            () => {
                log.info("Db connected succesfully");
                this.app = express();

                this.server = https.createServer({}, this.app);
                this.server.listen(443);

                if (IS_PRODUCTION)
                    log.info("------------ PRODUCTION ------------");
                else
                    log.info("------------ DEBUG ------------");

                this.app.use((express as Express).static(SERVER.STATIC));
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
                    throw err;
                });

                const serv = this.app.listen(SERVER.PORT, SERVER.HOST_NAME, () => {
                    log.info("app listen on", serv.address().address + ":" + serv.address().port);
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
