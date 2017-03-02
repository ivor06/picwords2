import {Server} from "./server";

let server = Server.bootstrap();

process.on("uncaughtException", (error) => { // TODO reboot server when unhandled rejection
    console.log("\n----- uncaughtException ----- \n", error);
    // server = Server.bootstrap();
});
