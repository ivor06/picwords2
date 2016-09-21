import {NgModule} from "@angular/core";
// import { HttpModule } from "@angular/http";
// import { RouterModule } from "@angular/router";
// import { FormsModule } from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";

@NgModule({
    imports: [BrowserModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}