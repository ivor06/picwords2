export {Message, MessageType}

class Message {
    clientId: string;
    userId: string;
    text: string;
    className: string;
    time: Date;
    answer: string;
    answerTime: number;
    answerLength: number;
    answerPoints: number;
    isSending: boolean;
    isSystem: boolean;
    isQuestion: boolean;
    isHint: boolean;
    isAnswered: boolean;
    isRecord: boolean;
    isLate: boolean;
    isNobodyAnswered: boolean;
    isStarted: boolean;
    isStopped: boolean;

    constructor(message?: MessageType) {
        if (message)
            for (let key in message)
                if (message.hasOwnProperty(key))
                    this[key] = message[key];
    }
}

type MessageType = {
    clientId?: string;
    userId?: string;
    text?: string;
    className?: string;
    time?: Date;
    answer?: string;
    answerTime?: number;
    answerLength?: number;
    answerPoints?: number;
    isSending?: boolean;
    isSystem?: boolean;
    isQuestion?: boolean;
    isHint?: boolean;
    isAnswered?: boolean;
    isRecord?: boolean;
    isLate?: boolean;
    isNobodyAnswered?: boolean;
    isStarted?: boolean;
    isStopped?: boolean;
}
