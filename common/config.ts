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
}

/* Client configure */
export namespace CLIENT {
    export const BUILD_PATH = "public";
    export const SRC_ROOT_PATH = "./client";
}

/* Database configure */
export namespace DB {
    export const COLLECTION = "picwords2";
}
