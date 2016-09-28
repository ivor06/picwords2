/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/body-parser/body-parser.d.ts" />

import * as http from "http";
import * as bodyParser from "body-parser";
import * as https from "https";
import * as express from "express";
import * as path from "path";
import {BaseError} from "../util/error";
import {HttpError} from "../util/error";
import {router} from "./routes/index";
import * as CONFIG from "../common/config";

export {
    Server
};

class Server {
    public app: express.Application;
    public server: https.Server;

    /**
     *  Bootstrap the application
     *
     *  @class Server
     *  @method bootstrap
     *  @static
     *  @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    public static  bootstrap(): Server {
        console.log("bootstrap");
        return new Server();
    }

    /**
     * Constructor
     *
     * @class Server
     * constructor
     */
    constructor() {
        // create express.js application
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

        this.app.use(express.static(path.join("../public")));
        this.app.use(bodyParser.json());
        this.app.use("/", router);
        this.app.use((req, res, next) => {
            next(new HttpError(404));
        });
        const serv = this.app.listen(port, hostname, function () {
            console.log("express app listen on ", serv.address().address + ":" + serv.address().port);
        });

        // this.app.use(express.methodOverride());
        // this.app.use("/components", express.static(__dirname + "/components"));
        // this.app.use("/js", express.static(__dirname + "/js"));
        // this.app.use("/icons", express.static(__dirname + "/icons"));

        // create https server
        // const self = this;
        // this.server = this.app.listen(3000, function () {
        //     console.log("server listening on", self.server.address().address + ":" + self.server.address().port);
        // });
        // this.server = https.createServer(this.app);
        //
        // this.server.listen(CONFIG.SERVER.PORT, CONFIG.SERVER.HOST_NAME);
        // this.server.on("error", (error: any) => {
        //     console.log("server on error");
        //     console.error(error);
        // });
        // const self = this;
        // this.server.on("listening", () => {
        //     console.log("server listening on", self.server.address().address + ":" + self.server.address().port);
        // });
    }
}
