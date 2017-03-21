import {HashString} from "../interfaces";
export {Feedback, FeedbackType}

class Feedback {
    id: string;
    userId: string;
    author: string;
    text: HashString;
    title: HashString;
    date: Date;
    reference: string;

    constructor(feedback?: FeedbackType) {
        if (feedback)
            for (let key in feedback)
                if (feedback.hasOwnProperty(key))
                    this[key] = feedback[key];
    }
}

type FeedbackType = {
    id?: string;
    userId?: string;
    author?: string;
    text?: HashString;
    title?: HashString;
    date?: Date;
    reference?: string;
}
