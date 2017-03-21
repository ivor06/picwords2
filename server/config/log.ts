import * as winston from "winston";
import "winston-daily-rotate-file";

import {SERVER, IS_PRODUCTION} from "./config";

const
    log = new (winston.Logger)({
        exitOnError: false,
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.DailyRotateFile)({
                name: 'daily.info.log',
                dataPattern: "-yyyy-MM-ddTHH",
                filename: SERVER.LOG_FILE,
                level: IS_PRODUCTION ? "debug" : "info"
            }),
            new (winston.transports.DailyRotateFile)({
                name: 'error.log',
                dataPattern: "-yyyy-MM-ddTHH",
                filename: SERVER.LOG_ERROR_FILE,
                level: 'error'
            })
        ]
    });

winston.handleExceptions([
    new (winston.transports.Console)(),
    new winston.transports.DailyRotateFile({
        dataPattern: "-yyyy-MM-ddTHH",
        filename: SERVER.LOG_EXCEPTIONS_FILE,
        handleExceptions: true,
        humanReadableUnhandledException: true
    })
]);

export {
    log
}
