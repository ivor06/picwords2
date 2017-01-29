import * as bcryptjs from "bcryptjs";

import {User, UserType, ProfileLocal, ProfileVk} from "../../common/classes/user";
import {connect} from "./db";
import {Collection, ObjectID} from "mongodb";
import {Request} from '~express/lib/request';
import {AUTH} from "../../common/config";
import {filterObjectKeys, removeObjectKeys, traversalObject} from "../../common/util";
import res = require("~express/lib/response");

export {
    findById,
    findByEmail,
    findByToken,
    findByRoom,
    cleanUser,
    unsetToken,
    updateUser,
    updateProfile,
    findOrCreateByProfile,
    generateHash,
    passwordToHashSync,
    validate,
    validateSync
}

const users: Promise<Collection> = connect().then(db => db.collection("users"));

function findByRoom(name: string): Promise<UserType> {
    return Promise.resolve({ // TODO replace stub with appropriate data
        "1": {
            name: "Petrushka",
            totalScore: 220
        },
        "2": {
            name: "Kolya",
            totalScore: 700
        },
        "3": {
            name: "Masha",
            totalScore: 94
        }
    });
}

function findById(id: string): Promise<UserType> {
    return users.then((usersCol: Collection) => usersCol
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next().then(replaceId));
}

function findByEmail(email: string): Promise<UserType> {
    return users.then((usersCol: Collection) => usersCol
        .find({"local.email": email})
        .limit(1)
        .next().then(replaceId));
}

function findByToken(token: string, profileName: string): Promise<UserType> {
    const query = profileName === "vk" ? {"vk.access_token": token} : {"local.token": token};
    return users.then((usersCol: Collection) => usersCol
        .find(query)
        .limit(1)
        .next().then(replaceId));
}

function insertUser(user: UserType): Promise<string> {
    return users.then(usersCol => usersCol
        .insertOne(user)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null)
    );
}

function unsetToken(token: string): Promise<number> {
    return users.then((usersCol: Collection) => usersCol
        .updateOne(
            {"vk.access_token": token},
            {$unset: {"vk.access_token": ""}}
        ))
        .then(result => result.result.ok && result.result.nModified);
}

function addProfile(id: string, profile: ProfileLocal|ProfileVk): Promise<boolean> {
    return users.then(usersCol => {
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
        return usersCol.updateOne({_id: new ObjectID(id)}, {$set: setObj}).then(result => result.result.ok && result.result.nModified === 1);
    });
}

function updateProfile(profile: ProfileLocal|ProfileVk): Promise<boolean> {
    return users.then(usersCol => {
        let profileName: string,
            searchObj = {};
        if (profile instanceof ProfileLocal) {
            profileName = "local";
            searchObj["local.email"] = (profile as ProfileLocal).email;
        } else if (profile instanceof ProfileVk) {
            profileName = "vk";
            searchObj["vk.id"] = profile.id;
        } else
            return new Promise((resole, reject) => reject("Cannot find/create user profile")); // TODO More simple, please!
        const setObj = buildSetObject(filterObjectKeys(profile, AUTH[profileName.toUpperCase()].USER_FIELD_LIST.concat([AUTH[profileName.toUpperCase()].TOKEN_FIELD])), profileName);
        return usersCol.updateOne(searchObj, {$set: setObj}).then(result => result.result.ok && result.result.nModified === 1);
    });
}

function updateUser(user: UserType): Promise<boolean> {
    return users.then((usersCol: Collection) => usersCol
        .updateOne(
            {_id: new ObjectID(user.id)},
            {$set: user},
            {upsert: true}
        ))
        .then(result => result.result.ok && result.result.nModified === 1);
}

function findOrCreateByProfile(profile: ProfileLocal, req?: Request): Promise<UserType>
function findOrCreateByProfile(profileVk: ProfileVk, req?: Request): Promise<UserType>
function findOrCreateByProfile(profile: ProfileLocal|ProfileVk, req?): Promise<UserType> {
    const id = (req.query && req.query.id) ? req.query.id : null;
    return users.then(usersCol => {
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
        return usersCol
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
                        return addProfile(id, profile).then(() => usersCol.deleteOne({_id: user.id}).then(() => findById(id)));
                    user[profileName] = Object.assign(user[profileName], profile);
                    return updateProfile(profile).then(() => user);
                }
                if (id) {
                    const user: UserType = {id: id};
                    user[profileName] = profile;
                    return addProfile(user.id, profile).then(() => user);
                }
                const newUser = new User(req ? {
                        achievements: {},
                        ipList: [req.connection.remoteAddress],
                        userAgentList: [req.headers["user-agent"]] // TODO header x-forwarded-for if server behind proxy
                    } : {achievements: {}}
                );
                newUser[profileName] = profile;
                return insertUser(newUser).then(id => Object.assign(newUser, {id: id}));
            });
    });
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
        achievements: dbUser.achievements
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

function replaceId(result: {_id: string, id?: string}) {
    if (result) {
        result.id = result._id;
        delete result._id;
    }
    return result;
}
