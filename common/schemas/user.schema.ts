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
        "local": {$ref: "#/definitions/LocalType"},
        "vk": {$ref: "#/definitions/VkType"}
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
            type: "object",
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
        },
        VkType: {
            type: "object",
            properties: {
                access_token: {type: "string"},
                expires_in: {type: "number"},
                // user_id: {type: "string"},
                id: {type: "number"},
                /* base VK user profile fields */
                first_name: {type: "string"},
                last_name: {type: "string"},
                deactivated: {type: "string"},
                hidden: {type: "number"},
                /* additional fields */
                about: {type: "string"},
                bdate: {type: "string"},
                city: {$ref: "#/definitions/VkCityType"},
                country: {$ref: "#/definitions/VkCityType"},
                exports: {type: "string"},
                has_mobile: {type: "number"},
                has_photo: {type: "number"},
                home_town: {type: "string"},
                nickname: {type: "string"},
                photo_id: {type: "string"},
                photo_50: {type: "string"},
                photo_max: {type: "string"},
                sex: {type: "number"},
                verified: {type: "string"}
            },
            additionalProperties: false
        },
        VkCityType: {
            type: "object",
            properties: {
                id: {type: "number"},
                title: {type: "string"}
            }
        }
    }
};
