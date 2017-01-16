import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {validate} from "jsonschema";

import {FormValidator} from "../../validators/form.validator";
import {User} from "../../../../common/classes/user";
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

export class UserFormComponent extends TranslateMixin implements OnInit {
    title: string;
    private form: FormGroup;
    private user: User = new User();

    private isLoading = true;

    constructor(private _formBuilder: FormBuilder,
                private _router: Router,
                private _route: ActivatedRoute,
                private _userService: UserService,
                private _broadcastMessageEvent: BroadcastMessageEvent) {
        super();
        this.form = this._formBuilder.group({
            name: ["", Validators.required],
            email: ["", Validators.compose([
                Validators.required,
                FormValidator.email
            ])],
            password: ["", Validators.required],
            avatar: [],
            about: [],
            city: []
        });
    }

    ngOnInit() {
        this._route.params.subscribe(params => {
            const id = params["id"];
            this.title = id ? "user-edit" : "user-new";
            if (id)
                this._userService.getUser(id)
                    .subscribe(
                        user => this.user = user,
                        error => {
                            console.error(error);
                            if (error.status === 404)
                                this._router.navigate(["users"]);
                        },
                        () => this.isLoading = false
                    );
            else
                this.isLoading = false;
        });
    }

    signUp() {
        const validateResult = validate(this.user, userSchema);
        if (validateResult && validateResult.errors.length === 0)
            this._userService.signUp(this.user)
                .then(user => {
                    if (user.token)
                        this._userService.setToken(user.token);
                    this._broadcastMessageEvent.emit("signin", user.name);
                    this._router.navigate(["/"]);
                })
                .catch(error => {
                    console.log("error in userService.signUp:", error); // TODO Modal/Dialog window
                });
    }
}
