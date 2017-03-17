import {Collection, ObjectID} from "mongodb";

import {connectDb, collections, replaceId} from "./db";
import {NewsType} from "../../common/classes/news";

export {
    findNewsById,
    findAllNews,
    insertNews
}

let newsCol: Collection;
connectDb().then(() => newsCol = collections["news"]);

function insertNews(news: NewsType): Promise<string> {
    return newsCol
        .insertOne(news)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null);
}

function findNewsById(id: string): Promise<NewsType> {
    return newsCol
        .find({_id: new ObjectID(id)})
        .map(replaceId)
        .limit(1)
        .next();
}

function findAllNews(): Promise<NewsType[]> {
    return newsCol
        .find({})
        .map(replaceId)
        .toArray();
}
