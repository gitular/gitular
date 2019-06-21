import 'zone.js/dist/zone-mix';
import 'reflect-metadata';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';

import {ElectronService} from './providers/electron.service';


import {AppComponent} from './app.component';


import {HeaderComponent} from './components/vertical/header/header.component';
import {BodyComponent} from './components/vertical/body/body.component';
import {FooterComponent} from './components/vertical/footer/footer.component';
import {VerticalComponent} from './components/vertical/vertical.component';
import {HorizontalComponent} from './components/horizontal/horizontal.component';
import {HorizontalMiddleComponent} from './components/horizontal/horizontal.middle/horizontal.middle.component';
import {HorizontalLeftComponent} from './components/horizontal/horizontal.left/horizontal.left.component';
import {HorizontalRightComponent} from './components/horizontal/horizontal.right/horizontal.right.component';
import {BasenamePipe} from './pipes/basename.pipe';
import {RepositoryComponent} from './components/repository/repository.component';
import {RepositorySidebarComponent} from './components/repository-sidebar/repository-sidebar.component';
import {HomeComponent} from './components/home/home.component';
import {BranchesComponent} from './components/branches/branches.component';
import {TagsComponent} from './components/tags/tags.component';
import {CommitComponent} from './components/commit/commit.component';
import {BrandComponent} from './components/brand/brand.component';
import {LogsComponent} from './components/logs/logs.component';
import {VerticalSplitterComponent} from './components/vertical-splitter/vertical-splitter.component';
import {HorizontalSplitterComponent} from './components/horizontal-splitter/horizontal-splitter.component';
import {RemotebranchesComponent} from './components/remotebranches/remotebranches.component';


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
        RemotebranchesComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
    ],
    providers: [ElectronService],
    bootstrap: [AppComponent]
})
export class AppModule {}
