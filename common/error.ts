export {BaseError, HttpError}

class BaseError {
    title?: string;
    message?: string;

    constructor(title?: string, message?: string) {
        this.title = title;
        this.message = message;
    }

    toString(): string {
        return (this.title ? this.title : "") + (this.message ? ": " + this.message : "");
    }
}

class HttpError extends BaseError {
    status: number;

    constructor(statusCode: number, title?: string, message?: string) {
        super(title, message);
        this.status = statusCode;
    }

    toString(): string {
        return this.status + " " + super.toString();
    }
}