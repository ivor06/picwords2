// import { enableProdMode } from '@angular/core'; TOTO use for production
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./components/app/app.component";
import {I18nService} from "./services/i18n.service";
import {SelectLangComponent} from "./components/select-lang/select-lang.component";
import {KeysPipe} from "./pipes/keys.pipe";
import {TranslatePipe} from "./pipes/translate.pipe";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        AppComponent,
        SelectLangComponent,
        KeysPipe,
        TranslatePipe
    ],
    providers: [
        I18nService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
