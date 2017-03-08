import {MongoClient, Db, Collection} from "mongodb";

import {DB} from "../../common/config";
import {HashObject, HashNumber} from "../../common/interfaces";

const
    collections: HashObject<Collection> = {},
    counts: HashNumber = {};

export {
    connectDb,
    disconnectDb,
    getDbStats,
    collections,
    counts
}

let users, questions: Collection;

function connectDb(): Promise<Db> {
    return MongoClient.connect(DB.URL).then(db => Promise.all(["users", "questions"]
        .filter(collectionName => db.collection(collectionName))
        .map(collectionName => db.collection(collectionName).count({}).then(count => {
            collections[collectionName] = db.collection(collectionName);
            counts[collectionName] = count;
            return count;
        }))).then(() => db));
}

function disconnectDb(): Promise<void> {
    return connectDb().then(db => db.close());
}

/* Get DB statistics */
function getDbStats() {
    return connectDb()
        .then(db => ['users', 'questions'].map(collectionName => {
            db.collection(collectionName) ? db.collection(collectionName).count({}).then(count => console.log("collection", collectionName, "has", count, "items")) : null;
        }));
}
