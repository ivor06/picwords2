/* Server configure */
export namespace SERVER {
    export const HOST_NAME = process.env.HOST_NAME || "127.0.0.1";
    export const PORT = process.env.PORT || 3000;
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