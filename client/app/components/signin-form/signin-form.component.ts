/// <reference path="../../../../typings/index.d.ts" />
import {Component, Output, EventEmitter} from "@angular/core";
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {FormValidator} from "../../validators/form.validator";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {UserService} from "../../services/user.service";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

@Component({
    moduleId: module.id,
    selector: "signin-form",
    templateUrl: "signin-form.component.html",
    styleUrls: ["signin-form.component.css"]
})

export class SignInFormComponent extends TranslateMixin {
    private _form: FormGroup;

    @Output() public submit = new EventEmitter();

    constructor(private formBuilder: FormBuilder,
                private router: Router,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
        this._form = this.formBuilder.group({
            email: ["", Validators.compose([
                Validators.required,
                FormValidator.email
            ])],
            password: ["", Validators.required]
        });
    }

    signin() {
        this._userService.signIn(this._form.value)
            .then(user => {
                this._broadcastMessageEvent.emit("signin", user.name);
                this.router.navigate(["/"]);
            })
            .catch(error => {
                console.log("error in userService.signIn:", error); // TODO Modal/Dialog window
            });
    }
}
