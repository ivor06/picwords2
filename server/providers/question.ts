import {Collection} from "mongodb";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";

import {connectDb, collections, counts} from "./db";
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
}

function findByNumber(number: number): Promise<QuestionType> {
    return questions
        .find({number: number})
        .project({_id: 0})
        .limit(1)
        .next() as Promise<QuestionType>;
}

function getRandomQuestion(): Observable<QuestionType> {
    const questionNumber = Math.floor(Math.random() * questionsAmount() + 1);
    return Observable.fromPromise(findByNumber(questionNumber).then(question => question ? question : this.getRandomQuestion()));
}
