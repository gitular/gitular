import {Component, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import {Repository} from '../../lib/Repository';
import {remote} from 'electron';

@Component({
    selector: 'app-remotebranches',
    templateUrl: './remotebranches.component.html',
    styleUrls: ['./remotebranches.component.css']
})
export class RemotebranchesComponent implements OnInit {

    @Input()
    repository: Repository;

    constructor(
        private ref: ChangeDetectorRef,
    ) {}

    ngOnInit() {
    }

    checkoutRemote(remoteBranch: string) {
        this.repository.checkoutRemote(remoteBranch).then(() => {
            this.ref.detectChanges();
        });
    }

    deleteRemote(remoteBranch: string) {
        this.repository.deleteRemoteBranch(remoteBranch).then(() => {
            this.ref.detectChanges();
        });
    }

    private pullRemote(remoteBranch: string) {
        this.repository.pullRemote(remoteBranch).then(() => {
            this.ref.detectChanges();
        });
    }

    private merge(branch: string) {

        return this.repository.merge(branch).then(() => {
            this.ref.detectChanges();
        });
    }

    private setUpstream(remoteBranch: string) {
        this.repository.setUpstream(remoteBranch).then(() => {
            this.ref.detectChanges();
        });
    }


    contextMenu(remoteBranch: string) {
        const menu = new remote.Menu();

        menu.append(new remote.MenuItem({
            label: 'Checkout as local branch',
            click: () => {
                this.checkoutRemote(remoteBranch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Pull remote',
            click: () => {
                this.pullRemote(remoteBranch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Merge',
            click: () => {
                this.merge(remoteBranch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Set as upstream',
            click: () => {
                this.setUpstream(remoteBranch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Delete',
            click: () => {
                this.deleteRemote(remoteBranch);
            }
        }));
        menu.popup({
            window: remote.BrowserWindow.getFocusedWindow()
        });
    }

}
