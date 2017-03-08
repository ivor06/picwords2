import {Component, Output, EventEmitter} from "@angular/core";
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {FormValidator} from "../../validators/form.validator";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {HttpError} from "../../../../common/classes/error";

const fb = new FormBuilder();

@Component({
    moduleId: module.id,
    selector: "signin-form",
    templateUrl: "signin-form.component.html",
    styleUrls: ["signin-form.component.css"]
})

export class SignInFormComponent extends TranslateMixin {
    private form: FormGroup;

    @Output() public submit = new EventEmitter();

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
    }

    onEnter() {
        if (this.form.valid)
            this.signin();
    }

    signin() {
        this._userService.signInLocal(this.form.value)
            .then(() => {
                this._router.navigate(["profile"]);
            })
            .catch(error => {
                console.log("error in userService.signIn:", error); // TODO Modal/Dialog window
            });
    }

    forgot() {
        this._userService.forgotPassword(this.form.value["email"])
            .then(result => {
                this._broadcastMessageEvent.emit("dialog.setContent", {
                    isError: !result,
                    header: this.getTranslation("forgot-header"),
                    text: this.getTranslation(result ? "forgot-success" : "forgot-error"),
                    isClosable: true,
                    isCloseOnClick: true
                });
                this._broadcastMessageEvent.emit("dialog.show", null);
            }, error => {
                // console.log("error:", error, "\n--------------\n");
                let errorObj: HttpError = null,
                    message: string = null;
                try {
                    errorObj = error.json();
                    if (errorObj.status && errorObj.status === 404)
                        message = this.getTranslation("forgot-error-user-not-found");
                } catch (e) {
                    console.error(e);
                }
                this._broadcastMessageEvent.emit("dialog.setContent", {
                    isError: true,
                    text: message ? message : this.getTranslation("forgot-error"),
                    isClosable: true,
                    isCloseOnClick: true
                });
                this._broadcastMessageEvent.emit("dialog.show", null);
            });
    }

    onSignUp() {
        this._router.navigate(["signup"]);
    }

    onVkAuth() {
        this._userService.signInVk()
            .then(() => {
                this._router.navigate(["profile"]);
            })
            .catch(error => {
                console.error("userService.onVkAuth error:", error);
            });
    }
}
