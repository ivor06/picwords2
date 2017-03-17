export {
    SERVER,
    DB,
    AUTH,
    GAME
}

/* Server configure */
namespace SERVER {
    export const HOST_NAME = "127.0.0.1"; // TODO HOST_NAME = process.env.HOST_NAME || "127.0.0.1"
    export const PORT = 3000; // TODO PORT = process.env.PORT || 3000
    export const SOCKET_IO_PORT = 3001;
    export const SRC_ROOT_PATH = "server";
    export const BUILD_PATH = "build-server";
    export const APP_PATH = "app.js";
    export const EMAIL = "user@picwords.ru";
}

/* Database configure */
namespace DB {
    export const COLLECTION = "victorinadb";
    export const URL = "mongodb://127.0.0.1:27017/" + COLLECTION;
}

/* Auth configure */
namespace AUTH {
    export const PROFILE_LIST = ["local", "vk"];
    export const COMMON_FIELD_LIST = ["id", "achievements"];
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
        SECRET_KEY: "******",
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
    export const QUESTION_TIME = 10000;
    export const QUESTION_DELAY = 2000;
    export const MAX_POINTS = 3;
    export const HINT_TIME = Math.floor(QUESTION_TIME / 3);
    export const NO_ANSWER_LIMIT = 10;
}
