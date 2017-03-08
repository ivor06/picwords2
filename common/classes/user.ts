import {HashObject} from "../interfaces";

export {
    User,
    UserType,
    Achievements,
    Visit,
    ProfileLocal,
    ProfileLocalType,
    ProfileVk,
    ProfileVkType,
    ErrorOnGetAccessTokenVk,
    UserSignin,
    UserByRoomType,
    UsersByRoom
}

class User {
    id: string;
    visitList: Visit[];
    achievements: Achievements;
    currentRoom: string;
    local: ProfileLocalType;
    vk: ProfileVkType;

    constructor(user?: UserType) {
        if (user)
            for (let key in user)
                if (user.hasOwnProperty(key))
                    this[key] = user[key];
    }
}

type UserType = {
    id?: string;
    visitList?: Visit[];
    achievements?: Achievements;
    local?: ProfileLocalType;
    vk?: ProfileVkType;
};

interface Visit {
    language?: string;
    timezone?: number;
    ip?: string;
    userAgent?: string;
    geo?: Geo;
    connectTime?: Date;
    disconnectTime?: Date;
    currentRoom?: string;
}

interface Geo {
    latitude?: number;
    longitude?: number;
    geo_id?: number;
    country_iso_code?: string;
    country?: string;
    city?: string;
    time_zone?: string;
}

interface Achievements {
    totalScore?: number;
    currentScore?: number;
    combo?: number[];
    minTime?: number;
}

type UserSignin = {
    email: string;
    password: string;
}

class ProfileLocal {
    name: string;
    email: string;
    password: string;
    token: string;
    avatar: string;
    about: string;
    country: string;
    city: string;

    constructor(profileLocal?: ProfileLocalType) {
        if (profileLocal)
            for (let key in profileLocal)
                if (profileLocal.hasOwnProperty(key))
                    this[key] = profileLocal[key];
    }
}

type ProfileLocalType = {
    name?: string;
    email?: string;
    password?: string;
    token?: string;
    avatar?: string;
    about?: string;
    country?: string;
    city?: string;
}

class ProfileVk {

    /* VK auth object fields */
    access_token: string;
    expires_in: number;
    id: number; // one of the base fields according https://vk.com/dev/objects/user

    /* base VK user profile fields */
    first_name: string;
    last_name: string;
    deactivated: string;
    hidden: number;

    /* additional fields */
    about: string;
    bdate: string;
    city: VkCityType;
    country: VkCityType;
    exports: string;
    has_mobile: number;
    has_photo: number;
    home_town: string;
    nickname: string;
    photo_id: string;
    photo_50: string;
    photo_max: string;
    sex: number;
    verified: string;

    constructor(profileVk?: ProfileVkType) {
        if (profileVk)
            for (let key in profileVk)
                if (profileVk.hasOwnProperty(key) && profileVk[key] !== "")
                    this[key] = profileVk[key];
    }
}

type ProfileVkType = {

    /* VK auth object fields */
    access_token: string;
    expires_in: number;
    id: number; // one of the base fields according https://vk.com/dev/objects/user

    /* base VK user profile fields */
    //uid?: string; // but some of real Vk service' answers contain uid instead id
    first_name?: string;
    last_name?: string;
    deactivated?: string;
    hidden?: number;

    /* additional fields */
    about?: string;
    bdate?: string;
    city?: VkCityType;
    country?: VkCityType;
    exports?: string;
    has_mobile?: number;
    has_photo?: number;
    home_town?: string;
    nickname?: string;
    photo_id?: string;
    photo_50?: string;
    photo_max?: string;
    sex?: number;
    verified?: string;
}

type ErrorOnGetAccessTokenVk = {
    error: any;
    error_description: any;
}

type VkCityType = number | {
    id: number;
    title: string;
}

type UserByRoomType = {
    name: string;
    achievements?: Achievements;
}

interface UsersByRoom extends HashObject<UserByRoomType> {
}
