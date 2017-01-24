import * as bcryptjs from "bcryptjs";

import {User, UserType, ProfileLocal, ProfileVk} from "../../common/classes/user";
import {connect} from "./db";
import {Collection, ObjectID} from "mongodb";
import {Request} from '~express/lib/request';

export {
    findById,
    findByEmail,
    findByToken,
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
    return users.then((usersCol: Collection) => usersCol
        .find({"vk.access_token": token})
        .limit(1)
        .next()) as Promise<UserType>;
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

function insertUser(user: UserType): Promise<string> { // TODO updateOne with upsert:true
    return users.then(usersCol => usersCol
        .insertOne(user)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null)
    );
}

function findOrCreateByProfile(profile: ProfileLocal, req?: Request): Promise<string>
function findOrCreateByProfile(profile: ProfileVk, req?: Request): Promise<string>
function findOrCreateByProfile(profile: ProfileLocal|ProfileVk, req?): Promise<string> { // TODO req Type
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
                    const newUser = new User(req ? {
                            ipList: [req.connection.remoteAddress],
                            userAgentList: [req.headers["user-agent"]] // TODO header x-forwarded-for if server behind proxy
                        } : {}
                    );
                    newUser[profileType] = profile;
                    return insertUser(newUser);
                }
                return (user.vk.access_token === (profile as ProfileVk).access_token)
                    ? Promise.resolve(user._id)
                    : updateUser({id: user._id, vk: profile as ProfileVk}).then(() => user._id);
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
