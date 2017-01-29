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
import {FooterComponent} from "./components/footer/footer.component";
import {BroadcastService} from "./services/broadcast.service";
import {BroadcastMessageEvent} from "./services/broadcast-message.event";
import {ResponsiveComponent} from "./components/responsive/responsive.component";
import {SignInFormComponent} from "./components/signin-form/signin-form.component";
import {ProfileComponent} from "./components/profile/profile.component";

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
        ResponsiveComponent,
        SelectLangComponent,
        KeysPipe,
        ObjectToArrayPipe,
        TranslatePipe,
        NavBarComponent,
        FooterComponent,
        ProfileComponent,
        SignInFormComponent,
        UserFormComponent,
        UsersComponent,
        GameComponent
    ],
    providers: [
        BroadcastMessageEvent,
        BroadcastService,
        I18nService,
        UserService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
