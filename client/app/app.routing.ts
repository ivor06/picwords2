import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {UserFormComponent} from "./components/user-form/user-form.component";
import {UsersComponent} from "./components/users/users.component";
import {GameComponent} from "./components/game/game.component";
import {SignInFormComponent} from "./components/signin-form/signin-form.component";

const appRoutes: Routes = [
    {
        path: "",
        // component: UsersComponent
        component: GameComponent
    },
    {
        path: "users/new",
        component: UserFormComponent
        // canDeactivate: [ PreventUnsavedChanges ]
    },
    {
        path: "users/:id",
        component: UserFormComponent
    },
    {
        path: "users",
        component: UsersComponent
    },
    {
        path: "signin",
        component: SignInFormComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
