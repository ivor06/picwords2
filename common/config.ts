import {HashObject} from "./interfaces";

const
    API_URL = "http://localhost:3000",
    SOCKET_IO_URL = "ws://localhost:3001",
    LANG_DEFAULT = "en",
    LANG_LIST = ["en-US", "ru-RU"],
    LANGUAGES: HashObject<LangObject> = {
        "en": {
            langName: "English",
            flagName: "us",
            selected: false
        },
        "ru": {
            langName: "Русский",
            flagName: "ru",
            selected: false
        }
    },
    MAIL_TO = "ivor06@yandex.ru";

export {
    API_URL,
    SOCKET_IO_URL,
    LANG_DEFAULT,
    LANG_LIST,
    LANGUAGES,
    MAIL_TO,
    CLIENT,
    AUTH,
    MESSAGES
}

type LangObject = {
    langName: string;
    flagName: string;
    selected: boolean;
};

/* Client configure */
namespace CLIENT {
    export const IMAGES_PATH = "assets/images";
    export const BUILD_PATH = "public";
    export const SRC_ROOT_PATH = "client";
    export const THROTTLE_TIME = 300;
    export const DISPLAY_MODES = {
        SM: 768,
        MD: 992,
        LG: 1200
    };
    export const IMAGE_SHOW_TIME = 3000; // ms
    export const ERROR_SHOW_TIME = 5000; // ms
}

/* Auth configure */
namespace AUTH {
    export const PROFILE_LIST = ["local", "vk"];
    export const LOCAL = {
        TOKEN_FIELD: "token"
    };
    export const VK = {
        TOKEN_FIELD: "access_token"
    };
}

/* Messages configure */
namespace MESSAGES {
    export const MAX_LENGTH = 200;
}
