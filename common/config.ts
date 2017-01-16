import {HashObject} from "./interfaces";

const
    API_URL = "http://localhost:3000",
    LANG_DEFAULT = "en",
    LANG_LIST = ["en-US", "ru-RU"],
    LANGUAGES: HashObject<LangObject> = {
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

export {
    API_URL,
    LANG_DEFAULT,
    LANG_LIST,
    LANGUAGES,
    SERVER,
    CLIENT,
    DB,
}

type LangObject = {
    langName: string;
    flagName: string;
    selected: boolean;
};

/* Server configure */
namespace SERVER {
    export const HOST_NAME = "127.0.0.1"; // TODO HOST_NAME = process.env.HOST_NAME || "127.0.0.1"
    export const PORT = 3000; // TODO PORT = process.env.PORT || 3000
    export const SRC_ROOT_PATH = "server";
    export const BUILD_PATH = "build-server";
    export const APP_PATH = "app.js";
    export const JWT_SECRET = "myJwtSecret";
}

/* Client configure */
namespace CLIENT {
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
namespace DB {
    export const COLLECTION = "victorinadb";
    export const URL = "mongodb://127.0.0.1:27017/" + COLLECTION;
}
