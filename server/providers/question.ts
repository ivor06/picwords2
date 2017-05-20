import {existsSync} from "fs";
import {Collection} from "mongodb";
import "rxjs/add/observable/of";
import "rxjs/add/observable/fromPromise";

import {connectDb, collections, counts} from "./db";
import {QuestionType} from "../../common/classes/question";
import {SERVER} from "../config/config";

export {
    findByNumber,
    insertQuestion,
    getRandomQuestion,
    questionsAmount,
    prepareQuestions
}

let
    questionsCol: Collection,
    questionList = [];

connectDb().then(() => questionsCol = collections["questions"]);

function prepareQuestions(): Promise<boolean> {
    return questionsCol
        .find({})
        .toArray()
        .then(
            questionListFromDb => {
                questionList = questionListFromDb
                    .filter(question => existsSync(SERVER.STATIC + "/assets/images/" + question.number + ".jpg"));
                console.log("questions amount:", questionList.length);
                return true;
            },
            error => false) as Promise<boolean>;
}

function questionsAmount(): number {
    return counts["questions"];
}

function insertQuestion(question: QuestionType): Promise<string> {
    return questionsCol
        .insertOne(question)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null) as Promise<string>;
}

function findByNumber(number: number): Promise<QuestionType> {
    return questionsCol
        .find({number: number})
        .project({_id: 0})
        .limit(1)
        .next() as Promise<QuestionType>;
}

function getRandomQuestion(): QuestionType {
    return questionList[Math.floor(Math.random() * questionList.length)];
}
