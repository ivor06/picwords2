/**
 *  On a mobile device need to load a module with Apache Cordova or NativeScript, using a bootstrap function that's specific to that platform.
 *  @angular-core instead  @angular/platform-browser-dynamic
 *  */
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);