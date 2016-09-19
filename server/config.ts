/* Server configure */
export namespace SERVER {
    export const HOST_NAME = process.env.HOST_NAME || "127.0.0.1";
    export const PORT = process.env.PORT || 3000;
}

/* Database configure */
export namespace DB {
    export const COLLECTION = "picwords2";
}