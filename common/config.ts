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
    AUTH
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
    export const URL = "******";
}

/* Auth configure */
namespace AUTH {
    export const LOCAL = {
        JWT_SECRET: "******"
    };
    export const VK = {
        APP_ID: "******", //  previous: "5826443"
        SECRET_KEY: "******", // previous: "Xw63uzr7jYGgVcTeyIkd"
        OAUTH_URL: "oauth.vk.com",
        OAUTH_URL_AUTHORIZE: "https://oauth.vk.com/authorize",
        AUTH_CALLBACK: "******",
        API_URL: "api.vk.com",
        API: {
            USER_FIELD_LIST: [
                "about", "bdate", "city", "country", "exports", "has_mobile", "has_photo",
                "home_town", "nickname", "photo_id", "photo_50", "photo_max", "sex", "verified"
            ],
            GET_USERS: "/method/users.get?",
            GET_PHOTO: "/method/photos.get?",
            SECURE: {
                CHECK_TOKEN: "/method/secure.checkToken?"
            },
            VERSION: "5.62"
        }
    };
}
