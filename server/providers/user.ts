import * as bcryptjs from "bcryptjs";

import {User, UserType} from "../../common/classes/user";
import {connect} from "./db";
import {Collection, UpdateWriteOpResult, ObjectID} from "mongodb";

export {
    findById,
    findByEmail,
    updateUser,
    passwordToHash,
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
        .find({email: email})
        .limit(1)
        .next()) as Promise<UserType>;
}

function updateUser(user: User): Promise<UpdateWriteOpResult> {
    return users.then((usersCol: Collection) => usersCol
        .updateOne(
            {email: user.email},
            user,
            {upsert: true}
        ));
}

function passwordToHash(password: string): Promise<string> {
    return bcryptjs.genSalt(1).then(salt => bcryptjs.hash(password, salt));
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
