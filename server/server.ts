import * as express from "express";
import * as bodyParser from "body-parser";
import * as passport from "passport";

import {HttpError} from "../common/error";
import * as CONFIG from "../common/config";
import {router} from "./routes/index";

export {
    Server
};

class Server {
    app: express.Application;

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
        this.app = express();

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
        }

        this.app.use(express.static("public"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use("/", router);
        this.app.use(function (req, res) {
            res.redirect("/");
        });
        this.app.use((req, res, next) => {
            next(new HttpError(404));
        });
        this.app.use((err, req, res, next) => {
            console.error("Error:", err);
            throw err;
        });
    }
}
