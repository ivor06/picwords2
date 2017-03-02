export {Question, QuestionType}

class Question {
    // id: string;
    number: number;
    text: string;
    points: number;
    answer: string;
    answerTime: number;
    timestamp: number;

    constructor(question?: QuestionType) {
        if (question)
            for (let key in question)
                if (question.hasOwnProperty(key))
                    this[key] = question[key];
    }
}

type QuestionType = {
    // id?: string;
    number?: number;
    text?: string;
    points?: number;
    answer?: string;
    answerTime: number;
    timestamp?: number;
}
