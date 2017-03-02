import {connectDb, collections, counts} from "./db";
import {Collection} from "mongodb";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";

import {QuestionType} from "../../common/classes/question";
import {removeObjectKeys} from "../../common/util";

export {
    findByNumber,
    getRandomQuestion,
    questionsAmount
}

let questions: Collection;
connectDb().then(() => questions = collections["questions"]);

function questionsAmount(): number {
    return counts["questions"];
    // return questions.count({});
}

function findByNumber(number: number): Promise<QuestionType> {
    return questions
        .find({number: number})
        .limit(1)
        .next()
        .then(question => removeObjectKeys(question, ["_id"]));
}

function getRandomQuestion(): Observable<QuestionType> {
    const questionNumber = Math.floor(Math.random() * questionsAmount() + 1);
    // console.log("getRandomQuestion", questionNumber);
    return Observable.fromPromise(findByNumber(questionNumber).then(question => question ? question : this.getRandomQuestion()));
}