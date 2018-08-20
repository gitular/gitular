import {Component, OnInit, Input} from '@angular/core';
import {Repository} from '../../lib/Repository';
import {remote} from 'electron';
import {ContextMenuBuilderService} from '../../services/context-menu-builder.service';

@Component({
    selector: 'app-remotebranches',
    templateUrl: './remotebranches.component.html',
    styleUrls: ['./remotebranches.component.css']
})
export class RemotebranchesComponent implements OnInit {

    @Input()
    repository: Repository;

    constructor(
        private contextMenuBuilderService: ContextMenuBuilderService
    ) {}

    ngOnInit() {
    }

    checkoutRemote(remoteBranch: string) {
        return this.repository.checkoutRemote(remoteBranch);
    }

    deleteRemote(remoteBranch: string) {
        return this.repository.deleteRemoteBranch(remoteBranch);
    }

    private pullRemote(remoteBranch: string) {
        return this.repository.pullRemote(remoteBranch);
    }

    private merge(branch: string) {

        return this.repository.merge(branch);
    }

    private setUpstream(remoteBranch: string) {
        return this.repository.setUpstream(remoteBranch);
    }


    contextMenu(remoteBranch: string) {

        this.contextMenuBuilderService.show({
            'Checkout as local branch': () => this.checkoutRemote(remoteBranch),
            'Pull remote': () => this.pullRemote(remoteBranch),
            'Merge': () => this.merge(remoteBranch),
            'Set as upstream': () => this.setUpstream(remoteBranch),
            'Delete': () => this.deleteRemote(remoteBranch),
        });
    }

}
