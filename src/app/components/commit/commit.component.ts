import {Component, OnInit, Input} from '@angular/core';
import {RepositoryService} from '../../services/repository.service';
import {IStatus} from '../../lib/RepositoryUtility';
import {Repository} from '../../lib/Repository';
import {remote} from 'electron';
import {ChangeDetectorRef} from '@angular/core';


@Component({
    selector: 'app-commit',
    templateUrl: './commit.component.html',
    styleUrls: ['./commit.component.css']
})
export class CommitComponent implements OnInit {

    @Input()
    repository: Repository;

    commitMessage: string;

    pushOnCommit: boolean;

    fileDiff: {
        status: IStatus,
        lines: string[]
    } | undefined = undefined;

    activeStatus: IStatus;

    constructor(
        private repositoryService: RepositoryService,
        private ref: ChangeDetectorRef,

    ) {
    }

    ngOnInit() {
    }

    reset(path: string) {
        this.repository.reset(path).then(() => {
            this.ref.detectChanges();
        });
    }

    add(path: string) {
        this.repository.add(path).then(() => {
            this.ref.detectChanges();
        });
    }
    
    discard(path: string) {
        this.repository.discardChanges(path).then(() => {
            this.ref.detectChanges();
        });
    }

    commit() {
        this.repository
            .commit(this.commitMessage)
            .then(() => {
                if (this.pushOnCommit) {
                    this.repository.pushOrigin();
                }
            });
        this.commitMessage = '';
    }

    selectStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = undefined;
            return;
        }

        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, false).subscribe((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = {
                    status,
                    lines
                };
                this.ref.detectChanges();
            });
    }

    selectIndexedStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = undefined;
            return;
        }

        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, true)
            .toPromise()
            .then((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = {
                    status: status,
                    lines
                };
                this.ref.detectChanges();
            });
    }

    contextMenu(status: IStatus) {
        const menu = new remote.Menu();

        if (status.working) {
            menu.append(new remote.MenuItem({
                label: 'Index',
                click: () => {
                    this.add(status.path);
                }
            }));
            menu.append(new remote.MenuItem({
                label: 'Discard',
                click: () => {
                    this.discard(status.path);
                }
            }));
        }
        if (status.indexed) {
            menu.append(new remote.MenuItem({
                label: 'Reset',
                click: () => {
                    this.reset(status.path);
                }
            }));
        }

        menu.popup({
            window: remote.BrowserWindow.getFocusedWindow()
        });
    }
}

