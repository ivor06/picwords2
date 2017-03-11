import {ModuleWithProviders} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {UserFormComponent} from "./components/user-form/user-form.component";
import {UsersComponent} from "./components/users/users.component";
import {GameComponent} from "./components/game/game.component";
import {SignInFormComponent} from "./components/signin-form/signin-form.component";
import {ProfileComponent} from "./components/profile/profile.component";
import {GameDeactivator} from "./deactivators/game.deactivator";

const appRoutes: Routes = [
    {
        path: "",
        component: GameComponent,
        canDeactivate: [GameDeactivator]
    },
    {
        path: "signup",
        component: UserFormComponent
    },
    {
        path: "profile/edit",
        component: UserFormComponent
    },
    {
        path: "users",
        component: UsersComponent
    },
    {
        path: "profile",
        component: ProfileComponent
    },
    {
        path: "profile/new/local",
        component: UserFormComponent
    },
    {
        path: "profile/:id",
        component: ProfileComponent
    },
    {
        path: "signin",
        component: SignInFormComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
