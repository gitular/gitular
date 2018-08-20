import {Component, OnInit, Input} from '@angular/core';
import {RepositoryService} from '../../services/repository.service';
import {IStatus} from '../../lib/RepositoryUtility';
import {Repository} from '../../lib/Repository';
import {ContextMenuBuilderService, Menu} from '../../services/context-menu-builder.service';


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
        private contextMenuBuilderService: ContextMenuBuilderService
    ) {
    }

    ngOnInit() {
    }

    reset(path: string) {
        return this.repository.reset(path);
    }

    add(path: string) {
        return this.repository.add(path);;
    }

    discard(path: string) {
        return this.repository.discardChanges(path);
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
            });
    }

    contextMenu(status: IStatus) {

        if (!status.indexed) {
            this.contextMenuBuilderService.show({
                'Index': () => this.add(status.path),
                'Discard': () => this.discard(status.path),
            });
        } else {
            this.contextMenuBuilderService.show({
                'Reset': () => this.reset(status.path),
            });
        }
    }
}

