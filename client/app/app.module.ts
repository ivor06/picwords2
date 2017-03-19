// import { enableProdMode } from '@angular/core'; TOTO use for production
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./components/app/app.component";
import {I18nService} from "./services/i18n.service";
import {SelectLangComponent} from "./components/select-lang/select-lang.component";
import {KeysPipe} from "./pipes/keys.pipe";
import {routing} from "./app.routing";
import {NavBarComponent} from "./components/navbar/navbar.component";
import {UserFormComponent} from "./components/user-form/user-form.component";
import {UserService} from "./services/user.service";
import {TranslatePipe} from "./pipes/translate.pipe";
import {UsersComponent} from "./components/users/users.component";
import {DataTableModule, SharedModule, InputTextareaModule, InputTextModule, ButtonModule} from "primeng/primeng";
import {GameComponent} from "./components/game/game.component";
import {ObjectToArrayPipe} from "./pipes/object-to-array.pipe";
import {BroadcastService} from "./services/broadcast.service";
import {BroadcastMessageEvent} from "./services/broadcast-message.event";
import {ResponsiveComponent} from "./components/responsive/responsive.component";
import {SignInFormComponent} from "./components/signin-form/signin-form.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {MessageService} from "./services/message.service";
import {DialogWindowComponent} from "./components/dialog-window/dialog-window.component";
import {ImageService} from "./services/image.service";
import {YandexMetrikaComponent} from "./components/yandex-metrika/yandex-metrika.component";
import {FooterStickComponent} from "./components/footer-stick/footer-stick.component";
import {GameDeactivator} from "./deactivators/game.deactivator";
import {ProgressBarComponent} from "./components/progress-bar/progress-bar.component";
import {NewsService} from "./services/news.service";
import {NewsComponent} from "./components/news/news.component";
import {FeedbackService} from "./services/feedback.service";
import {FeedbackComponent} from "./components/feedback/feedback.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        DataTableModule,
        InputTextareaModule,
        InputTextModule,
        ButtonModule,
        SharedModule,
        routing
    ],
    declarations: [
        AppComponent,
        DialogWindowComponent,
        ResponsiveComponent,
        SelectLangComponent,
        KeysPipe,
        ObjectToArrayPipe,
        TranslatePipe,
        NavBarComponent,
        ProfileComponent,
        SignInFormComponent,
        UserFormComponent,
        UsersComponent,
        FeedbackComponent,
        NewsComponent,
        GameComponent,
        ProgressBarComponent,
        FooterStickComponent,
        YandexMetrikaComponent
    ],
    providers: [
        BroadcastMessageEvent,
        BroadcastService,
        I18nService,
        ImageService,
        MessageService,
        FeedbackService,
        NewsService,
        UserService,
        GameDeactivator
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
