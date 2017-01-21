import {HashObject} from "../interfaces";

export {User, IUser, UserType, ProfileLocal, ProfileLocalType, ProfileVk, UserSignin, UserByRoomType, UsersByRoom}

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
    access_token: string;
    expires_in: number;
    user_id: string;

    constructor(profileVk?: ProfileVkType) {
        if (profileVk)
            for (let key in profileVk)
                if (profileVk.hasOwnProperty(key))
                    this[key] = profileVk[key];
    }
}

type ProfileVkType = {
    access_token: string;
    expires_in: number;
    user_id: string
}

type UserByRoomType = {
    name: string;
    totalScore: number;
    id?: string;
}

interface UsersByRoom extends HashObject<UserByRoomType> {
}
