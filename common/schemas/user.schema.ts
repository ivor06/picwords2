import {JsonSchema} from "../interfaces";

export const userSchema: JsonSchema = {
    id: "/User",
    type: "object",
    properties: {
        "id": {type: "string"},
        "language": {type: "string"},
        "history": {type: "string"},
        "lastVisit": {type: "date"},
        "geo": {$ref: "#/definitions/GeoType"},
        "achievements": {$ref: "#/definitions/AchievementsType"},
        "currentRoom": {type: "string"},
        "local": {$ref: "#/definitions/LocalType"}
    },
    additionalProperties: false,
    definitions: {
        GeoType: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
                latitude: {type: "number"},
                longitude: {type: "number"}
            },
            additionalProperties: false
        },
        AchievementsType: {
            type: "object",
            required: ["totalScore", "currentScore", "combo"],
            properties: {
                totalScore: {type: "number"},
                currentScore: {type: "number"},
                combo: {type: "number"},
                minTime: {type: "number"}
            },
            additionalProperties: false
        },
        LocalType: {
            type: "object", // TODO required
            properties: {
                name: {type: "string"},
                email: {type: "string"},
                password: {type: "string"},
                token: {type: "string"},
                avatar: {type: "string"},
                about: {type: "string"},
                country: {type: "string"},
                city: {type: "string"}
            },
            additionalProperties: false
        }
    }
};
