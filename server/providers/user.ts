import * as bcryptjs from "bcryptjs";

import {User, UserType, ProfileLocal, ProfileVk} from "../../common/classes/user";
import {connect} from "./db";
import {Collection, ObjectID} from "mongodb";
import {Request} from '~express/lib/request';

export {
    findById,
    findByEmail,
    findByToken,
    unsetToken,
    updateUser,
    findOrCreateByProfile,
    generateHash,
    passwordToHashSync,
    validate,
    validateSync
}

const users: Promise<Collection> = connect().then(db => db.collection("users"));

function findById(id: string): Promise<UserType> {
    return users.then((usersCol: Collection) => usersCol
        .find({_id: new ObjectID(id)})
        .limit(1)
        .next()) as Promise<UserType>;
}

function findByEmail(email: string): Promise<UserType> {
    return users.then((usersCol: Collection) => usersCol
        .find({"local.email": email})
        .limit(1)
        .next()) as Promise<UserType>;
}

function findByToken(token: string): Promise<UserType> {
    const
        profileName = token.length === 149 ? "local" : "vk",
        query = profileName === "vk" ? {"vk.access_token": token} : {"local.token": token}; // TODO Too weird!
    return users.then((usersCol: Collection) => usersCol
        .find(query)
        .limit(1)
        .next()) as Promise<UserType>;
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

function updateUser(user: UserType): Promise<number> {
    return users.then((usersCol: Collection) => usersCol
        .updateOne(
            {_id: new ObjectID(user.id)},
            {$set: user},
            {upsert: true}
        ))
        .then(result => result.result.ok && result.result.nModified);
}

function findOrCreateByProfile(profile: ProfileLocal, req?: Request): Promise<UserType>
function findOrCreateByProfile(profile: ProfileVk, req?: Request): Promise<UserType>
function findOrCreateByProfile(profile: ProfileLocal|ProfileVk, req?): Promise<UserType> { // TODO req Type
    return users.then(usersCol => {
        let profileType: string,
            searchObj: any;
        if (profile instanceof ProfileLocal) {
            profileType = "local";
            searchObj = {"local.email": profile["email"]};
        } else if (profile instanceof ProfileVk) {
            profileType = "vk";
            searchObj = {"vk.user_id": profile["user_id"]};
        } else {
            return new Promise((resole, reject) => reject("Cannot find/create user profile")); // TODO More sipmle, please!
        }
        return usersCol
            .find(searchObj)
            .limit(1)
            .next()
            .then((user: UserType) => {
                if (!user) {
                    if (req.body.id) {
                        const
                            id: string = req.body.id;
                        user = {id: id, _id: id};
                        user[profileType] = profile;
                        return updateUser(user).then(() => user);
                    }
                    const newUser = new User(req ? {
                            ipList: [req.connection.remoteAddress],
                            userAgentList: [req.headers["user-agent"]] // TODO header x-forwarded-for if server behind proxy
                        } : {}
                    );
                    newUser[profileType] = profile;
                    return insertUser(newUser).then(id => Object.assign(newUser, {id: id, _id: id}));
                }
                return ((profile as ProfileVk).access_token && (user.vk.access_token === (profile as ProfileVk).access_token)) // TODO Too weird!
                    ? Promise.resolve(user)
                    : updateUser({id: user._id, vk: profile as ProfileVk}).then(() => {
                    user[profileType] = profile;
                    return user;
                });
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
