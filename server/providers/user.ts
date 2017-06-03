import {Collection, ObjectID} from "mongodb";
import {Observable} from "rxjs/Observable";
import * as express from "express";
import * as bcryptjs from "bcryptjs";

import {User, UserType, ProfileLocal, ProfileVk, UsersByRoom, Achievements, Visit} from "../../common/classes/user";
import {MessageController} from "../controllers/message";
import {collections, connectDb, replaceId} from "./db";
import {AUTH} from "../config/config";
import {filterObjectKeys, removeObjectKeys, traversalObject, rejectedPromise} from "../../common/util";

export {
    findById,
    findByEmail,
    findByToken,
    findByRoom,
    findAll,
    cleanUser,
    unsetToken,
    insertUser,
    updateUser,
    updateProfile,
    updateToken,
    updatePasswordHash,
    updateAchievements,
    updateVisitList,
    findOrCreateByProfile,
    generateHash,
    generatePassword,
    passwordToHashSync,
    validate,
    validateSync,
    setOnline
}

const userIdsOnline = {};

let users: Collection;
connectDb().then(() => users = collections["users"]);

function findByRoom(name: string): Observable<UsersByRoom> {
    return Observable.of(MessageController.getUsersByRoom()); // TODO use room' name
}

function findById(id: string): Promise<UserType> {
    return users
        .find({_id: new ObjectID(id)})
        .map(replaceId)
        .limit(1)
        .next() as Promise<UserType>;
}

function findByEmail(email: string): Promise<UserType> {
    return users
        .find({"local.email": email})
        .map(replaceId)
        .limit(1)
        .next() as Promise<UserType>;
}

function findByToken(token: string, profileName: string): Promise<UserType> {
    const query = profileName === "vk" ? {"vk.access_token": token} : {"local.token": token};
    return users
        .find(query)
        .map(replaceId)
        .limit(1)
        .next() as Promise<UserType>;
}

function findAll(): Promise<UserType[]> {
    return users
        .find({})
        .project({
            "achievements": 1,
            "visitList.connectTime": 1,
            "visitList.disconnectTime": 1,
            "visitList": {$slice: -1},
            "local.name": 1,
            "local.avatar": 1,
            "local.city": 1,
            "vk.nickname": 1,
            "vk.first_name": 1,
            "vk.last_name": 1,
            "vk.has_photo": 1,
            "vk.photo_50": 1,
            "vk.city": 1
        })
        .map(user => {
            if (isOnline(user["_id"]))
                user.isOnline = true;
            return replaceId(user);
        })
        .toArray() as Promise<UserType[]>;
}

function insertUser(user: UserType): Promise<string> { // TODO Validate
    return users
        .insertOne(user)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null) as Promise<string>;
}

function setToken(id: string, token: string): Promise<number> {
    return users.updateOne(
        {_id: new ObjectID(id)},
        {
            $set: {
                "local.token": token
            }
        })
        .then(result => result.result.ok && result.result.nModified) as Promise<number>;
}

function unsetToken(token: string): Promise<number> {
    return users
        .updateOne(
            {"vk.access_token": token},
            {$unset: {"vk.access_token": ""}}
        )
        .then(result => result.result.ok && result.result.nModified) as Promise<number>;
}

function addProfile(id: string, profile: ProfileLocal | ProfileVk): Promise<boolean> {
    const setObj = {};
    let profileName: string;
    if (profile instanceof ProfileLocal) {
        profileName = "local";
    } else if (profile instanceof ProfileVk) {
        profileName = "vk";
    } else {
        return new Promise((resole, reject) => reject("Cannot find/create user profile")); // TODO More simple, please!
    }
    setObj[profileName] = profile;
    return users.updateOne({_id: new ObjectID(id)}, {$set: setObj}).then(result => result.result.ok && result.result.nModified === 1) as Promise<boolean>;
}

function updateProfile(profile: ProfileLocal | ProfileVk): Promise<boolean> {
    let profileName: string,
        searchObj = {};
    if (profile instanceof ProfileLocal) {
        profileName = "local";
        searchObj["local.email"] = (profile as ProfileLocal).email;
    } else if (profile instanceof ProfileVk) {
        profileName = "vk";
        searchObj["vk.id"] = profile.id;
    } else
        return rejectedPromise(false);
    const setObj = buildSetObject(filterObjectKeys(profile, AUTH[profileName.toUpperCase()].USER_FIELD_LIST.concat([AUTH[profileName.toUpperCase()].TOKEN_FIELD])), profileName);
    return users.updateOne(searchObj, {$set: setObj})
        .then(result => result.result.ok && result.result.nModified === 1) as Promise<boolean>;
}

function updateToken(id: string, token?: string): Promise<boolean> {
    return users.updateOne(
        {_id: new ObjectID(id)},
        {
            $set: {
                "local.token": token
            }
        })
        .then(result => result.result.ok && result.result.nModified === 1) as Promise<boolean>;
}

function updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    return users.updateOne(
        {_id: new ObjectID(id)},
        {
            $set: {
                "local.password": passwordHash
            }
        })
        .then(result => result.result.ok && result.result.nModified === 1) as Promise<boolean>;
}

function updateUser(user: UserType): Promise<boolean> {
    return users
        .updateOne(
            {_id: new ObjectID(user.id)},
            {$set: user},
            {upsert: true}
        )
        .then(result => result.result.ok && result.result.nModified === 1)  as Promise<boolean>;
}

function updateAchievements(userId: string, achievements: Achievements): Promise<boolean> {
    return users
        .updateOne(
            {_id: new ObjectID(userId)},
            {$set: {achievements: achievements}}
        )
        .then(result => result.result.ok && result.result.nModified === 1)  as Promise<boolean>;
}

function updateVisitList(userId: string, visit: Visit): Promise<boolean> {
    return users
        .updateOne(
            {_id: new ObjectID(userId)},
            {$push: {visitList: visit}}
        )
        .then(result => result.result.ok && result.result.nModified === 1)  as Promise<boolean>;
}

function findOrCreateByProfile(profileVk: ProfileVk, req?: express.Request): Promise<UserType>
function findOrCreateByProfile(profile: ProfileLocal, req?: express.Request): Promise<UserType>
function findOrCreateByProfile(profile: ProfileLocal | ProfileVk, req?): Promise<UserType> {
    const id = (req && req.query && req.query.id) ? req.query.id : null;
    let profileName: string,
        searchObj: any;
    if (profile instanceof ProfileLocal) {
        profileName = "local";
        searchObj = {"local.email": profile["email"]};
    } else if (profile instanceof ProfileVk) {
        profileName = "vk";
        // searchObj = {"vk.user_id": profile["user_id"]};
        searchObj = {"vk.id": profile["id"]};
    } else {
        return new Promise((resole, reject) => reject("Cannot find / create user profile"));
    }
    return users
        .find(searchObj)
        .limit(1)
        .next()
        .then((user: UserType) => {
            if (user) {
                if (profileName === "local")
                    return null;
                user.id = user["_id"];
                delete user["_id"];
                if (id && id !== user.id.toString())
                    return addProfile(id, profile).then(() => users.deleteOne({_id: user.id}).then(() => findById(id)));
                user[profileName] = Object.assign(user[profileName], profile);
                return updateProfile(profile).then(() => user);
            }
            if (id) {
                const newUser: UserType = {id: id};
                newUser[profileName] = profile;
                return addProfile(newUser.id, profile).then(() => newUser);
            }
            const newUser = new User({
                achievements: {
                    totalScore: 0,
                    currentScore: 0,
                    combo: []
                },
                roles: {},
                visitList: []
            });
            newUser[profileName] = profile;
            return insertUser(newUser).then(insertedId => Object.assign(newUser, {id: insertedId}));
        }) as Promise<UserType>;
}

function generatePassword(length = 6): string {
    const
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        charsetLength = charset.length;
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    return password;
}

function generateHash(password: string): Promise<string> {
    return bcryptjs.genSalt(1).then(salt => bcryptjs.hash(password, salt)); // TODO common/utils the same ?
}

function passwordToHashSync(password: string): string {
    return bcryptjs.hashSync(password, bcryptjs.genSaltSync());
}

function validate(password: string, password2: string): Promise<boolean> {
    return bcryptjs.compare(password, password2);
}

function validateSync(password: string, password2: string): boolean {
    return bcryptjs.compareSync(password, password2);
}

function cleanUser(dbUser: UserType, removeCredentialsList: string[] = null): UserType {
    const user: UserType = {
        id: dbUser.id,
        achievements: dbUser.achievements,
        roles: dbUser.roles
    };
    AUTH.PROFILE_LIST
        .filter(profileName => !!dbUser[profileName])
        .forEach(profileName => user[profileName] = removeObjectKeys(
            dbUser[profileName],
            AUTH[profileName.toUpperCase()].REMOVE_FIELD_LIST.concat(removeCredentialsList ? removeCredentialsList : AUTH[profileName.toUpperCase()].CREDENTIALS_LIST)
        ));
    return user;
}

function buildSetObject(obj, profileName) {
    const result = {};
    traversalObject(obj, (value, key) => {
        const setObjKey = profileName + "." + key;
        result[setObjKey] = value;
    });
    return result;
}

function setOnline(userId: string, isOnline: boolean) {
    if (isOnline && !userIdsOnline[userId])
        userIdsOnline[userId] = true;
    if (!isOnline)
        delete userIdsOnline[userId];
}

function isOnline(userId: string) {
    return !!userIdsOnline[userId];
}
