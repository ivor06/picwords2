import {HashObject} from "../interfaces";

export {
    User,
    IUser,
    UserType,
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
    _id: string;
    id: string;
    language: string;
    history: UserHistory;
    lastVisit: Date;
    geo: GeoCoordinates;
    userAgentList: string[];
    ipList: string[];
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
    _id?: string;
    id?: string;
    language?: string;
    history?: UserHistory;
    lastVisit?: Date;
    geo?: GeoCoordinates;
    userAgentList?: string[];
    ipList?: string[];
    achievements?: Achievements;
    currentRoom?: string;
    local?: ProfileLocalType;
    vk?: ProfileVkType;
};

interface IUser extends User {
}

interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

interface Achievements {
    totalScore?: number;
    currentScore?: number;
    combo?: number[];
    minTime?: number;
}

interface UserHistory {
    visitList?: any[],
    lastTime?: Date
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
    user_id: string;

    /* base VK user profile fields */
    id: string; // one of the base fields according https://vk.com/dev/objects/user
    uid: string; // but real Vk service' answer contains uid instead id
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
    has_photo: string;
    home_town: string;
    nickname: string;
    photo_id: string;
    photo_100: string;
    photo_max: string;
    sex: string;
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
    user_id?: string;

    /* base VK user profile fields */
    id?: string; // one of the base fields according https://vk.com/dev/objects/user
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
    has_photo?: string;
    home_town?: string;
    nickname?: string;
    photo_id?: string;
    photo_50?: string;
    photo_max?: string;
    sex?: string;
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
    totalScore: number;
    id?: string;
}

interface UsersByRoom extends HashObject<UserByRoomType> {
}
