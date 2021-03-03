
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import "reflect-metadata";
import "zone.js/dist/zone-mix";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BranchesComponent } from "./components/branches/branches.component";
import { BrandComponent } from "./components/brand/brand.component";
import { HomeComponent } from "./components/home/home.component";
import { LogsComponent } from "./components/logs/logs.component";
import { RemoteBranchesComponent as RemoteBranchesComponent } from "./components/remotebranches/remotebranches.component";
import { RepositorySidebarComponent } from "./components/repository-sidebar/repository-sidebar.component";
import { RepositoryComponent } from "./components/repository/repository.component";
import { TagsComponent } from "./components/tags/tags.component";
import { BodyComponent } from "./components/vertical/body/body.component";
import { FooterComponent } from "./components/vertical/footer/footer.component";
import { HeaderComponent } from "./components/vertical/header/header.component";
import { VerticalComponent } from "./components/vertical/vertical.component";
import { BasenamePipe } from "./pipes/basename.pipe";
import { ElectronService } from "./providers/electron.service";
import {AngularSplitModule} from "angular-split";
import { CommitBoxComponent } from './components/commit-box/commit-box.component';
import { DiffComponent } from './components/diff/diff.component';
import { StatusTableComponent } from './components/status-table/status-table.component';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        BodyComponent,
        FooterComponent,
        VerticalComponent,
        BasenamePipe,
        RepositoryComponent,
        RepositorySidebarComponent,
        HomeComponent,
        BranchesComponent,
        TagsComponent,
        BrandComponent,
        LogsComponent,
        RemoteBranchesComponent,
        CommitBoxComponent,
        DiffComponent,
        StatusTableComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        AngularSplitModule,
    ],
    providers: [ElectronService],
    bootstrap: [AppComponent],
})
export class AppModule {}
