import {JsonSchema} from "../interfaces";

export const userSchema: JsonSchema = { // TODO Generate from User;s class.
    id: "/User",
    type: "object",
    properties: {
        "id": {type: "string"},
        "isOnline": {type: "string"},
        "roles": {type: "string"},
        "visitList": {
            type: "array",
            items: {$ref: "#/definitions/VisitType"}
        },
        "achievements": {$ref: "#/definitions/AchievementsType"},
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
                longitude: {type: "number"},
                geo_id: {type: "number"},
                country_iso_code: {type: "string"},
                country: {type: "string"},
                city: {type: "string"},
                time_zone: {type: "string"}
            },
            additionalProperties: false
        },
        AchievementsType: {
            type: "object",
            required: ["totalScore"],
            properties: {
                totalScore: {type: "number"},
                currentScore: {type: "number"},
                combo: {
                    type: "array",
                    items: {type: "number"}
                },
                minTime: {type: "number"}
            },
            additionalProperties: false
        },
        RolesType: {
            type: "object",
            properties: {
                isAdmin: {type: "boolean"},
                isModerator: {type: "boolean"}
            },
            additionalProperties: false
        },
        VisitType: {
            type: "object",
            properties: {
                language: {type: "string"},
                ip: {type: "string"},
                userAgent: {type: "string"},
                timezone: {type: "number"},
                geo: {$ref: "#/definitions/GeoType"},
                connectTime: {type: "Date"},
                disconnectTime: {type: "Date"},
                currentRoom: {type: "string"}
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
