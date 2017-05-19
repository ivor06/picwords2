import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";

import {TranslateMixin} from "../../pipes/translate.mixin";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {FeedbackService} from "../../services/feedback.service";
import {FeedbackType} from "../../../../common/classes/feedback";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LANGUAGES, CLIENT} from "../../../../common/config";
import {UserService} from "../../services/user.service";
import {User} from "../../../../common/classes/user";

@Component({
    moduleId: module.id,
    selector: "feedback",
    templateUrl: "feedback.component.html",
    styleUrls: ["feedback.component.css"]
})

export class FeedbackComponent extends TranslateMixin implements OnInit {
    isGiveFeedback = false;
    langList = Object.keys(LANGUAGES);
    languages = LANGUAGES;
    private form: FormGroup;
    private altLang: string;
    private feedbackList: FeedbackType[] = [];
    private feedback: FeedbackType = {
        title: {},
        text: {}
    };
    private reference: string = null;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private formBuilder: FormBuilder,
                private userService: UserService,
                private feedbackService: FeedbackService,
                private broadcastMessageEvent: BroadcastMessageEvent) {
        super();

        this.broadcastMessageEvent.emit("progress.start", true);

        this.feedback.userId = this.userService.getCurrentUserId();
        this.feedback.author = User.getName(this.userService.getCurrentUser());
        this.form = this.formBuilder.group({
            author: ["", Validators.required],
            title: [],
            text: ["", Validators.required],
            reference: [this.reference]
        });
    }

    ngOnInit() {
        this.altLang = this.langList.filter(lang => lang === this.currentLanguage)[0];
        setTimeout(() => {
            this.route.url.subscribe(url => {
                this.isGiveFeedback = url.length === 2;
                if (!this.isGiveFeedback)
                    this.feedbackService.getFeedbackAll()
                        .subscribe(
                            feedbackList => this.feedbackList = feedbackList.sort((a: FeedbackType, b: FeedbackType) => (a.date > b.date) ? -1 : 1),
                            error => {
                                console.log("error:", error);
                                this.broadcastMessageEvent.emit("dialog.setContent", {
                                    isError: true,
                                    text: this.getTranslation("feedback-error")
                                });
                                this.broadcastMessageEvent.emit("dialog.show", CLIENT.ERROR_SHOW_TIME);
                                this.broadcastMessageEvent.emit("progress.start", false);
                            },
                            () => this.broadcastMessageEvent.emit("progress.start", false)
                        );
                else
                    this.broadcastMessageEvent.emit("progress.start", false);
            });
        }, 0);
    }

    save() {
        this.broadcastMessageEvent.emit("progress.start", true);
        this.feedbackService.addFeedback(Object.assign(this.feedback, {date: new Date()}))
            .subscribe(
                () => {
                    this.broadcastMessageEvent.emit("dialog.setContent", {
                        text: this.getTranslation("feedback-success")
                    });
                    this.broadcastMessageEvent.emit("dialog.show", CLIENT.ERROR_SHOW_TIME);
                    // this.router.navigate(["feedback"]);
                    this.feedbackList.push(this.feedback);
                    this.feedback = {
                        title: {},
                        text: {}
                    };
                    this.isGiveFeedback = false;
                },
                error => {
                    this.broadcastMessageEvent.emit("dialog.setContent", {
                        isError: true,
                        text: this.getTranslation("give-feedback-error")
                    });
                    this.broadcastMessageEvent.emit("dialog.show", CLIENT.ERROR_SHOW_TIME);
                    this.broadcastMessageEvent.emit("progress.start", false);
                },
                () => this.broadcastMessageEvent.emit("progress.start", false)
            );
    }

    onGive() {
        this.isGiveFeedback = true;
    }
}
