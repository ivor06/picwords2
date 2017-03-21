import {createTransport} from "nodemailer";

import {SERVER} from "../config/config";
import {EmailType} from "../../common/classes/email";
import {DirectOptions} from "nodemailer-direct-transport";

export {
    sendEmail
}

const transporter = createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail"
} as DirectOptions);

function sendEmail(email: EmailType) {
    return transporter.sendMail(Object.assign(email, {from: SERVER.EMAIL}));
}
