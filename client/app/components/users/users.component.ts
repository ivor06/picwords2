import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

import {UserRatingType} from "../../../../common/classes/user";
import {UserService} from "../../services/user.service";
import {TranslateMixin} from "../../pipes/translate.mixin";
import {isNumber} from "../../../../common/util";

const ROW_HEIGHT = 60;

@Component({
    moduleId: module.id,
    selector: "users",
    templateUrl: "users.component.html",
    styleUrls: ["users.component.css"]
})

export class UsersComponent extends TranslateMixin implements OnInit {
    private userList: UserRatingType[];
    private rowsAmount = 10;
    private cols = null;

    constructor(private _router: Router,
                private _userService: UserService) {
        super();
    }

    ngOnInit() {
        this.calculateRowsAmount();
        setTimeout(() => {
            this.cols = [
                {field: "name", header: this.getTranslation("user"), formatType: "user", sortable: true},
                {field: "totalScore", header: this.getTranslation("user-score"), formatType: "number", sortable: true},
                {field: "minTime", header: this.getTranslation("user-min-time"), formatType: "number", sortable: true},
                {field: "city", header: this.getTranslation("user-city"), formatType: "long-string", sortable: true},
                {
                    field: "lastVisit",
                    header: this.getTranslation("user-last-visit"),
                    formatType: "date",
                    formatParams: "'hh:mm:ss'",
                    sortable: true
                }
            ];
            this._userService.getUserList()
                .subscribe(userList => this.userList = userList.map(user => ({
                    id: user.id,
                    avatar: (user.vk && user.vk.photo_50) ? user.vk.photo_50 : (user.local && user.local.avatar ? user.local.avatar : null),
                    name: user.vk ? user.vk.first_name + " " + user.vk.last_name : (user.local ? user.local.name : "Player"),
                    city: (user.vk && user.vk.city) ? user.vk.city["title"] : (user.local && user.local.city ? user.local.city : null),
                    lastVisit: (user.visitList && user.visitList.length) ? user.visitList[0].disconnectTime : null,
                    minTime: (user.achievements && isNumber(user.achievements.minTime)) ? (user.achievements.minTime / 1000) : null,
                    totalScore: (user.achievements && isNumber(user.achievements.totalScore)) ? user.achievements.totalScore : null
                })));
        }, 0);
    }

    onUserClick(user) {
        this._router.navigate(["profile/" + user.id || ""]);
    }

    calculateRowsAmount() {
        let usersWrapper,
            wrapperHeight,
            wrapperPaddings,
            uiWidgetHeader,
            isError = false;
        try {
            usersWrapper = document.getElementsByClassName("users-wrapper")[0];
            wrapperHeight = usersWrapper["offsetHeight"];
            wrapperPaddings = parseFloat(getComputedStyle(usersWrapper).paddingTop) + parseFloat(getComputedStyle(usersWrapper).paddingBottom);
            uiWidgetHeader = document.getElementsByClassName("ui-widget-header")[0]["offsetHeight"];
        } catch (e) {
            isError = true
        }
        if (!isError) {
            const rowsAmount = Math.floor((wrapperHeight - wrapperPaddings - (uiWidgetHeader * 3)) / ROW_HEIGHT);
            this.rowsAmount = rowsAmount > 0 ? rowsAmount : 1;
        }
    }
}
