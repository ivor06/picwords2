import {HashObject} from "./interfaces";

const
    API_URL = "http://localhost:3000",
    SOCKET_IO_URL = "ws://localhost:3001",
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
    SOCKET_IO_URL,
    LANG_DEFAULT,
    LANG_LIST,
    LANGUAGES,
    SERVER,
    CLIENT,
    DB,
    AUTH,
    GAME,
    MESSAGES
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
    export const SOCKET_IO_PORT = 3001;
    export const SRC_ROOT_PATH = "server";
    export const BUILD_PATH = "build-server";
    export const APP_PATH = "app.js";
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
    export const COLLECTION = "******";
    export const URL = "mongodb://******/" + COLLECTION;
}

/* Auth configure */
namespace AUTH {
    export const PROFILE_LIST = ["local", "vk"];
    export const COMMON_FIELD_LIST = ["id", "achievements", "language"];
    export const LOCAL = {
        JWT_SECRET: "******",
        CREDENTIALS_LIST: ["email", "token"],
        REMOVE_FIELD_LIST: ["password"],
        TOKEN_FIELD: "token",
        USER_FIELD_LIST: [
            "name", "avatar", "about", "city", "country"
        ]
    };
    export const VK = {
        APP_ID: "******",
        CREDENTIALS_LIST: ["access_token"],
        REMOVE_FIELD_LIST: ["expires_in", "deactivated", "hidden", "bdate", "exports", "has_mobile", "verified"],
        SERVICE_ACCESS_TOKEN: "******",
        SECRET_KEY: "******", // previous: "Xw63uzr7jYGgVcTeyIkd"
        TOKEN_FIELD: "access_token",
        OAUTH_URL: "oauth.vk.com",
        OAUTH_URL_AUTHORIZE: "https://oauth.vk.com/authorize",
        AUTH_CALLBACK: "http://localhost:3000/auth/vk/callback",
        API_URL: "api.vk.com",
        USER_FIELD_LIST: [
            "about", "bdate", "city", "country", "exports", "has_mobile", "has_photo",
            "home_town", "nickname", "photo_id", "photo_50", "photo_max", "sex", "verified"
        ],
        API: {
            GET_USERS: "/method/users.get?",
            GET_PHOTO: "/method/photos.get?",
            SECURE: {
                CHECK_TOKEN: "/method/secure.checkToken?"
            },
            VERSION: "5.62"
        }
    };
}


/* Game configure */
namespace GAME {
    export const QUESTION_TIME = 20000;
    export const QUESTION_DELAY = 2000;
    export const MAX_POINTS = 3;
    export const HINT_TIME = Math.floor(QUESTION_TIME / 3);
    export const NO_ANSWER_LIMIT = 10;
}


/* Messages configure */
namespace MESSAGES {
    export const MAX_LENGTH = 200;
}
