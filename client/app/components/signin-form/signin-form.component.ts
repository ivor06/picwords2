import {Component, Output, EventEmitter} from "@angular/core";
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {FormValidator} from "../../validators/form.validator";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

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

    signin() {
        this._userService.signInLocal(this.form.value)
            .then(() => {
                this._router.navigate(["profile"]);
            })
            .catch(error => {
                console.log("error in userService.signIn:", error); // TODO Modal/Dialog window
            });
    }

    onSignUp() {
        this._router.navigate(["signup"]);
    }

    onVkAuth() {
        this._userService.signInVk()
            .then((data) => {
                this._router.navigate(["profile"]);
            })
            .catch(error => {
                console.error("userService.onVkAuth error:", error);
            });
    }
}
