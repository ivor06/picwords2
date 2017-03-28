import {Component, Output, EventEmitter} from "@angular/core";
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {FormValidator} from "../../validators/form.validator";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {isContainsValue} from "../../../../common/util";
import {HttpError} from "../../../../common/classes/error";

const fb = new FormBuilder();

@Component({
    moduleId: module.id,
    selector: "signin-form",
    templateUrl: "signin-form.component.html",
    styleUrls: ["signin-form.component.css"]
})

export class SignInFormComponent extends TranslateMixin {
    @Output() public submit = new EventEmitter();

    private form: FormGroup;

    constructor(private _formBuilder: FormBuilder,
                private _router: Router,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
        this.form = fb.group({
            email: ["", Validators.compose([
                Validators.required,
                FormValidator.email
            ])],
            password: ["", Validators.required]
        });
        this._broadcastMessageEvent.emit("progress.start", false);
    }

    onEnter() {
        if (this.form.valid)
            this.signin();
    }

    signin() {
        this._broadcastMessageEvent.emit("progress.start", true);
        this._userService.signInLocal(this.form.value)
            .then(
                () => this._router.navigate([""]),
                error => {
                    let message: string = null;
                    if (error && error.status && isContainsValue([401, 404], error.status))
                        message = this.getTranslation("signin-error-unauthorized");
                    else {
                        let errorObj: HttpError = null;
                        try {
                            errorObj = error.json();
                            if (errorObj && errorObj.status && isContainsValue([401, 404], errorObj.status))
                                message = this.getTranslation("signin-error-user-not-found");
                        } catch (e) {
                        }
                    }
                    this._broadcastMessageEvent.emit("dialog.setContent", {
                        isError: true,
                        text: message ? message : this.getTranslation("signin-error")
                    });
                    this._broadcastMessageEvent.emit("progress.start", false);
                    this._broadcastMessageEvent.emit("dialog.show", null);
                });
    }

    forgot() {
        this._broadcastMessageEvent.emit("progress.start", true);
        this._userService.forgotPassword(this.form.value["email"])
            .then(result => {
                this._broadcastMessageEvent.emit("dialog.setContent", {
                    isError: !result,
                    header: this.getTranslation("forgot-header"),
                    text: this.getTranslation(result ? "forgot-success" : "forgot-error")
                });
                this._broadcastMessageEvent.emit("progress.start", false);
                this._broadcastMessageEvent.emit("dialog.show", null);
            }, error => {
                let message: string = null;
                if (error.status && error.status === 404)
                    message = this.getTranslation("forgot-error-user-not-found");

                this._broadcastMessageEvent.emit("dialog.setContent", {
                    isError: true,
                    text: message ? message : this.getTranslation("forgot-error")
                });
                this._broadcastMessageEvent.emit("progress.start", false);
                this._broadcastMessageEvent.emit("dialog.show", null);
            });
    }

    onSignUp() {
        this._broadcastMessageEvent.emit("progress.start", true);
        this._router.navigate(["signup"]);
    }

    onVkAuth() {
        this._broadcastMessageEvent.emit("progress.start", true);
        this._userService.signInVk()
            .then(() => {
                this._broadcastMessageEvent.emit("progress.start", false);
                this._router.navigate([""]);
            })
            .catch(() => this._broadcastMessageEvent.emit("progress.start", false));
    }
}
