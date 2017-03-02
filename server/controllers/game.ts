import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/";
import "rxjs/add/observable/interval";
import "rxjs/add/operator/takeUntil";

import {GAME} from "../../common/config";
import {getRandomQuestion} from "../providers/question";
import {QuestionType} from "../../common/classes/question";
import {Message, MessageType} from "../../common/classes/message";

export {
    GameController
}

const
    getRandomPositionList = (length: number): number[] => {
        const list: number[] = [];
        for (let i = 0; i < length; i++)
            list[i] = i;

        /* Letters position exchange */
        for (let i = 0; i < length; i++) {
            const
                j = Math.floor(Math.random() * length),
                k = Math.floor(Math.random() * length),
                save = list[j];
            list[j] = list[k];
            list[k] = save;
        }
        return list;
    },
    getHintLettersAmount = (word: string): number => {
        const amount = Math.floor(word.length / 3 + 1);
        return (amount < 1) ? 1 : amount;
    };

class GameController {
    private startStop = new Subject<boolean>();
    private intervalQuestion = Observable.interval(GAME.QUESTION_TIME).startWith(null);
    private intervalHint = Observable.interval(GAME.HINT_TIME).take(2);
    private question: QuestionType;
    private isAnswered = false;
    private hintPositionList: number[] = [];
    private hintLetterList: number[] = [];
    private hintLetterTotal = 0;

    answersBus = new Subject<Message>();
    questionsBus = new Subject<MessageType>();
    isGameProcessing = false;

    constructor() {
        const stSource = this.startStop.asObservable()
            .filter(start => start)
            .flatMap(() => this.intervalQuestion.takeUntil(this.startStop.asObservable()));

        const questionAnsweredSource = this.answersBus
            .filter((message: Message) => {
                if (this.question && message.text === this.question.answer) {
                    console.log("correct answer!", this.isAnswered);
                    if (!this.isAnswered) {
                        this.isAnswered = true;
                        this.question.answerTime = Date.now();
                        this.questionsBus.next({
                            clientId: message.clientId,
                            time: new Date(),
                            answer: this.question.answer,
                            answerPoints: this.question.points,
                            answerTime: this.question.answerTime - this.question.timestamp,
                            isAnswered: true
                        });
                        return true;
                    }
                    this.questionsBus.next({
                        clientId: message.clientId,
                        time: new Date(),
                        answerTime: Date.now() - this.question.answerTime,
                        isLate: true
                    });
                }
                return false;
            })
            .delay(GAME.QUESTION_DELAY)
            .startWith(null);

        Observable
            .combineLatest(questionAnsweredSource, stSource,
                (answer, stSource) => (answer === null && this.question)
                    ? this.questionsBus.next({
                    time: new Date(),
                    answer: this.question.answer,
                    isNobodyAnswered: true
                })
                    : null
            )
            .subscribe(() => {
                getRandomQuestion()
                // .timestamp()
                    .subscribe(question => {
                        this.question = Object.assign(question, {
                            timestamp: Date.now(),
                            points: GAME.MAX_POINTS
                        });
                        this.askQuestion();
                        this.isAnswered = false;
                        this.intervalHint
                            .takeWhile(data => !this.isAnswered)
                            .subscribe(this.showHint.bind(this));
                    }, error => console.log);
            });
    }

    start() {
        if (!this.isGameProcessing) {
            console.log("start game");
            this.isGameProcessing = true;
            this.questionsBus.next({
                time: new Date(),
                isStarted: true
            });
            this.startStop.next(true);
        }
    }

    stop() {
        if (this.isGameProcessing) {
            console.log("stop game");
            this.startStop.next(false);
            this.isGameProcessing = false;
            delete this["question"];
            this.questionsBus.next({
                time: new Date(),
                isStopped: true
            });
        }
    }

    askQuestion(socketID?: string) {
        if (this.isGameProcessing && this.question) {
            const questionMessage: MessageType = {
                text: this.question.text,
                time: new Date(),
                answerLength: this.question.answer.length,
                isQuestion: true
            };
            if (socketID)
                questionMessage.clientId = socketID;
            this.questionsBus.next(questionMessage);
        }
    }

    noAnswer() {
        console.log("noAnswer");
        this.questionsBus.next({
            time: new Date(),
            isNobodyAnswered: true
        });
        this.askQuestion();
    }

    showHint(order: number) {
        if (!this.isGameProcessing || !(this.question && this.question.answer) || this.isAnswered)
            return;
        const
            answer = this.question.answer,
            length = answer.length,
            hintLettersAmount = getHintLettersAmount(answer) - 1 + order;

        /* Author of hint processing algorithm is Mikhail Maximov */
        if (order === 0) {
            this.hintPositionList = getRandomPositionList(length);
            this.hintLetterTotal = 0;
            this.hintLetterList = [];
            for (let i = 0; i < length; i++)
                this.hintLetterList[i] = 0;
        }
        for (let i = 0; i < length; i++) {
            for (let k = 0; k < hintLettersAmount; k++) {
                if (this.hintLetterList[this.hintPositionList[i]] === 0) {
                    this.hintLetterList[this.hintPositionList[i]] = 1;
                    this.hintLetterTotal++;
                    if (this.hintLetterTotal >= hintLettersAmount)
                        break;
                }
            }
            if (this.hintLetterTotal >= hintLettersAmount)
                break;
        }

        let hint = "";
        for (let i = 0; i < length; i++) {
            hint += this.hintLetterList[i] ? answer.charAt(i) : "*";
        }

        this.questionsBus.next({
            time: new Date(),
            text: hint,
            isHint: true
        });
        if (this.question.points > 1)
            this.question.points--;
    }
}
