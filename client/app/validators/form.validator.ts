import {FormControl} from "@angular/forms";

const RE_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export class FormValidator {
    static cannotContainSpace(control: FormControl) {
        return (control.value.indexOf(" ") > 0) ? {cannotContainSpace: true} : null;
    }

    static email(control: FormControl) {
        return RE_EMAIL.test(control.value) ? null : {invalidEmail: true};
    }
}
