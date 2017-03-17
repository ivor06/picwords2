import {HashString} from "../interfaces";
export {News, NewsType}

class News {
    text: HashString;
    title: HashString;
    date: Date;

    constructor(news?: NewsType) {
        if (news)
            for (let key in news)
                if (news.hasOwnProperty(key))
                    this[key] = news[key];
    }
}

type NewsType = {
    text?: HashString;
    title?: HashString;
    date?: Date;
}
