import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {validate} from "jsonschema";

import {FormValidator} from "../../validators/form.validator";
import {UserType} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {userSchema} from "../../../../common/schemas/user.schema";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";

@Component({
    moduleId: module.id,
    selector: "user-form",
    templateUrl: "user-form.component.html",
    styleUrls: ["user-form.component.css"]
})

export class UserFormComponent extends TranslateMixin {
    private form: FormGroup;
    private user: UserType;
    private isEdit: boolean = null;

    constructor(private _formBuilder: FormBuilder,
                private _router: Router,
                private _broadcastMessageEvent: BroadcastMessageEvent,
                private _userService: UserService) {
        super();
        this._broadcastMessageEvent.emit("progress.start", true);
        this.user = this._userService.getCurrentUser();
        if (this.user && this.user.local)
            this.isEdit = true;
        else {
            this.isEdit = null;
            this.user = {local: {}};
        }
        const controlsConfig = {
            name: ["", Validators.required],
            email: ["", Validators.compose([ // TODO Check email registered already
                Validators.required,
                FormValidator.email
            ])],
            avatar: [],
            about: [],
            city: []
        };
        this.form = this._formBuilder.group(Object.assign(controlsConfig, this.isEdit ? {} : {password: ["", Validators.required]}));
        this._broadcastMessageEvent.emit("progress.start", false);
    }

    onEnter() {
        if (this.form.valid)
            this.save();
    }

    save() {
        this._broadcastMessageEvent.emit("progress.start", true);
        const validateResult = validate(this.user, userSchema);
        if (validateResult && validateResult.errors.length === 0)
            this._userService[this.isEdit ? "edit" : "signUp"](this.user.local)
                .then(() => this._router.navigate(["profile"]))
                .catch(error => {
                    let message: string = null;
                    if (error && error.status) {
                        if (error.status === 403)
                            message = this.getTranslation("signup-error-user-found");
                        else if (error.status === 400)
                            message = this.getTranslation("signup-error-bad-request");
                    }
                    this._broadcastMessageEvent.emit("dialog.setContent", {
                        isError: true,
                        text: message ? message : this.getTranslation("signin-error")
                    });
                    this._broadcastMessageEvent.emit("progress.start", false);
                    this._broadcastMessageEvent.emit("dialog.show", null);
                });
    }
}
