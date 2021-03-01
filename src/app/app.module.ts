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
import { CommitComponent } from "./components/commit/commit.component";
import { HomeComponent } from "./components/home/home.component";
import { HorizontalSplitterComponent } from "./components/horizontal-splitter/horizontal-splitter.component";
import { HorizontalComponent } from "./components/horizontal/horizontal.component";
import { HorizontalLeftComponent } from "./components/horizontal/horizontal.left/horizontal.left.component";
import { HorizontalMiddleComponent } from "./components/horizontal/horizontal.middle/horizontal.middle.component";
import { HorizontalRightComponent } from "./components/horizontal/horizontal.right/horizontal.right.component";
import { LogsComponent } from "./components/logs/logs.component";
import { RemotebranchesComponent } from "./components/remotebranches/remotebranches.component";
import { RepositorySidebarComponent } from "./components/repository-sidebar/repository-sidebar.component";
import { RepositoryComponent } from "./components/repository/repository.component";
import { TagsComponent } from "./components/tags/tags.component";
import { VerticalSplitterComponent } from "./components/vertical-splitter/vertical-splitter.component";
import { BodyComponent } from "./components/vertical/body/body.component";
import { FooterComponent } from "./components/vertical/footer/footer.component";
import { HeaderComponent } from "./components/vertical/header/header.component";
import { VerticalComponent } from "./components/vertical/vertical.component";
import { BasenamePipe } from "./pipes/basename.pipe";
import { ElectronService } from "./providers/electron.service";
import {AngularSplitModule} from "angular-split";
import { StagingComponent } from './components/staging/staging.component';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        BodyComponent,
        FooterComponent,
        VerticalComponent,
        HorizontalComponent,
        HorizontalMiddleComponent,
        HorizontalLeftComponent,
        HorizontalRightComponent,
        BasenamePipe,
        RepositoryComponent,
        RepositorySidebarComponent,
        HomeComponent,
        BranchesComponent,
        TagsComponent,
        CommitComponent,
        BrandComponent,
        LogsComponent,
        VerticalSplitterComponent,
        HorizontalSplitterComponent,
        RemotebranchesComponent,
        StagingComponent,
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
