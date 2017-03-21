import {Server} from "./server";
import {disconnectDb} from "./providers/db";
import {log} from "./config/log";

Server.bootstrap();

process.on("uncaughtException", (error) => { // TODO reboot server when unhandled rejection
    log.error("\n----- uncaughtException ----- \n", error);
    disconnectDb();
});
