import * as express from "express";
import {Express} from "~express/lib/express"
import * as bodyParser from "body-parser";
import * as passport from "passport";
import * as http from "http";
import * as https from "https";

import {connectDb, disconnectDb} from "./providers/db";
import {HttpError} from "../common/classes/error";
import * as CONFIG from "../common/config";
import {router} from "./routes/index";
import {routerAuth} from "./routes/auth";
import {MessageController} from "./controllers/message";

export {
    Server
};

class Server {
    app: express.Application;
    serverHttp: http.Server;
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
                // console.log("Db connected succesfully");
                this.app = express();

                this.server = https.createServer({}, this.app);
                this.server.listen(443);

                // configure application
                let hostname: string, port: number;
                if (process.env.NODE_ENV === "production") {
                    console.log("------------ PRODUCTION ------------");
                    hostname = "localhost";
                    port = 80;
                } else {
                    console.log("------------ DEBUG ------------");
                    hostname = "localhost";
                    port = CONFIG.SERVER.PORT;
                    // port = 443;
                }

                this.app.use((express as Express).static("public"));
                // this.app.use(expressSession({
                //     secret: "mySecret",
                //     resave: true,
                //     saveUninitialized: false
                // }));
                this.app.use(bodyParser.json());
                this.app.use(bodyParser.urlencoded({extended: false}));
                // this.app.use(cors());
                // this.app.use("/", (req, res, next) => {
                //     res.header("Access-Control-Allow-Origin", "*");
                //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                //     next();
                // });
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
                    console.error("Error:", err);
                    throw err;
                });

                const serv = this.app.listen(port, hostname, () => {
                    // console.log("express app listen on ", serv.address().address + ":" + serv.address().port);
                });

                let messageController = new MessageController();
                messageController.start();
            },
            error => {
                console.error(error);
                disconnectDb();
            });
    }
}
