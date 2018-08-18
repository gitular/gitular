import {Component, OnInit, Input} from '@angular/core';
import {Repository} from '../../lib/Repository';

@Component({
    selector: 'app-remotebranches',
    templateUrl: './remotebranches.component.html',
    styleUrls: ['./remotebranches.component.css']
})
export class RemotebranchesComponent implements OnInit {

    @Input()
    repository: Repository;

    constructor() {}

    ngOnInit() {
    }

    checkoutRemote(remoteBranch: string) {
        this.repository.checkoutRemote(remoteBranch);
    }

}
