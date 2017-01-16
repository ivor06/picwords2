// import {GeoCoordinates, Achievements, UserHistory, HashObject} from "../interfaces";
import {HashObject} from "../interfaces";

export {User, IUser, UserType, UserRegister, UserSignin, UserByRoomType, UsersByRoom}

class User {
    id: string;
    name: string;
    email: string;
    password: string;
    token?: string;
    language?: string;
    avatar?: string;
    about?: string;
    country?: string;
    city?: string;
    history?: UserHistory;
    lastVisit?: Date;
    geo?: GeoCoordinates;
    userAgentList?: string[];
    achievements?: Achievements;
    currentRoom?: string;
}

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

type UserRegister = {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    about?: string;
    country?: string;
    city?: string;
}

type UserSignin = {
    email: string;
    password: string;
}

type UserType = {
    id?: string;
    name: string;
    email: string;
    password?: string;
    language?: string;
    avatar?: string;
    about?: string;
    country?: string;
    city?: string;
    history?: UserHistory;
    lastVisit?: Date;
    geo?: GeoCoordinates;
    userAgentList?: string[];
    achievements?: Achievements;
    currentRoom?: string;
};

type UserByRoomType = {
    name: string;
    totalScore: number;
    id?: string;
}

interface UsersByRoom extends HashObject<UserByRoomType> {
}
