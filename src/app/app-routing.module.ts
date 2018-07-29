import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RepositoryComponent} from './components/repository/repository.component';
import {HomeComponent} from './components/home/home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'repository/:id',
        component: RepositoryComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
//        enableTracing: true
    })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
