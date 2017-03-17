import {Component, OnInit} from "@angular/core";

import {TranslateMixin} from "../../pipes/translate.mixin";
import {BroadcastMessageEvent} from "../../services/broadcast-message.event";
import {NewsService} from "../../services/news.service";
import {NewsType} from "../../../../common/classes/news";
import {CLIENT} from "../../../../common/config";

@Component({
    moduleId: module.id,
    selector: "news",
    templateUrl: "news.component.html",
    styleUrls: ["news.component.css"]
})

export class NewsComponent extends TranslateMixin implements OnInit {

    private newsList: NewsType[];

    constructor(private newsService: NewsService,
                private broadcastMessageEvent: BroadcastMessageEvent) {
        super();
        this.broadcastMessageEvent.emit("progress.start", true);
    }

    ngOnInit() {
        this.newsService.getNews()
            .subscribe(
                newsList => this.newsList = newsList.sort((a: NewsType, b: NewsType) => (a.date > b.date) ? -1 : 1),
                error => {
                    this.broadcastMessageEvent.emit("dialog.setContent", {
                        isError: true,
                        text: this.getTranslation("news-error")
                    });
                    this.broadcastMessageEvent.emit("dialog.show", CLIENT.ERROR_SHOW_TIME);
                    this.broadcastMessageEvent.emit("progress.start", false);
                },
                () => this.broadcastMessageEvent.emit("progress.start", false)
            );
    }
}
