import {Collection, ObjectID} from "mongodb";

import {connectDb, collections, replaceId} from "./db";
import {FeedbackType} from "../../common/classes/Feedback";

export {
    findFeedbackById,
    findAllFeedback,
    insertFeedback
}

let feedbackCol: Collection;
connectDb().then(() => feedbackCol = collections["feedback"]);

function insertFeedback(feedback: FeedbackType): Promise<string> {
    return feedbackCol
        .insertOne(feedback)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null) as Promise<string>;
}

function findFeedbackById(id: string): Promise<FeedbackType> {
    return feedbackCol
        .find({_id: new ObjectID(id)})
        .map(replaceId)
        .limit(1)
        .next() as Promise<FeedbackType>;
}

function findAllFeedback(): Promise<FeedbackType[]> {
    return feedbackCol
        .find({})
        .map(replaceId)
        .toArray() as Promise<FeedbackType[]>;
}
