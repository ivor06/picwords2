import {MongoClient, Db} from "mongodb";

import {DB} from "../../common/config";
import {Collection} from "mongodb";

export {
    connect,
    getDbStats
}

function connect(): Promise<Db> {
    return MongoClient.connect(DB.URL);
}

/* Get DB statistics */
function getDbStats() {
    return connect()
        .then(db => ['users', 'questions'].map(collectionName => {
            db[collectionName] ? (db[collectionName] as Collection).count({}).then(count => console.log("collection", collectionName, "has", count, "items")) : null;
        }));
}
