import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./components/home/home.component";
import { RepositoryComponent } from "./components/repository/repository.component";

const routes: Routes = [
    {
        component: HomeComponent,
        path: "",
    },
    {
        component: RepositoryComponent,
        path: "repository/:id",
    },
];
/**
 * AppRoutingModule.
 */
@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        //        EnableTracing: true
    })],
})
export class AppRoutingModule {}
