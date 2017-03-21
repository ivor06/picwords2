export {Email, EmailType}

const RE_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class Email {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;

    constructor(email?: EmailType) {
        if (email)
            for (let key in email)
                if (email.hasOwnProperty(key))
                    this[key] = email[key];
    }

    static validate(email: string): boolean {
        return RE_EMAIL.test(email);
    }
}

type EmailType = {
    from?: string;
    to?: string[];
    subject?: string;
    text?: string;
    html?: string;
}
