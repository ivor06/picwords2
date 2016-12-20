import {HashObject} from "./interfaces";

type LangObject = {
    langName: string;
    flagName: string;
    selected: boolean;
};

export const LANG_DEFAULT = "en";

export const LANG_LIST = ["en-US", "ru-RU"];

export const LANGUAGES: HashObject<LangObject> = {
    "en": {
        langName: "English / English",
        flagName: "us",
        selected: false
    },
    "ru": {
        langName: "Русский / Russian",
        flagName: "ru",
        selected: false
    }
};

/* Server configure */
export namespace SERVER {
    export const HOST_NAME = "127.0.0.1"; // TODO HOST_NAME = process.env.HOST_NAME || "127.0.0.1"
    export const PORT = 3000; // TODO PORT = process.env.PORT || 3000
    export const SRC_ROOT_PATH = "server";
    export const BUILD_PATH = "build-server";
    export const APP_PATH = "app.js";
}

/* Client configure */
export namespace CLIENT {
    export const BUILD_PATH = "public";
    export const SRC_ROOT_PATH = "client";
    export const THROTTLE_TIME = 300;
    export const DISPLAY_MODES = {
        SM: 768,
        MD: 992,
        LG: 1200
    };
}

/* Database configure */
export namespace DB {
    export const COLLECTION = "picwords2";
}
