import {Component, OnInit, Input} from '@angular/core';
import {RepositoryService} from '../../services/repository.service';
import {IStatus} from '../../lib/RepositoryUtility';
import {Repository} from '../../lib/Repository';

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

    fileDiff: string[] = [];

    activeStatus: IStatus;

    constructor(
        private repositoryService: RepositoryService
    ) {
    }

    ngOnInit() {

        this.refresh();
        this.repository
            .workingCopyUpdate
            .subscribe(() => {
                this.refresh();
            });


    }

    public refresh() {
        this.repository.fetchStatus();
    }

    reset(path: string) {
        this.repository
            .reset(path);
    }

    add(path: string) {
        this.repository
            .add(path);
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
            this.fileDiff = [];
            return;
        }

        this.activeStatus = status;
        this.fileDiff = [];
        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, false).subscribe((line: string) => {
                this.fileDiff.push(line);
            });
    }

    selectIndexedStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = [];
            return;
        }

        this.activeStatus = status;
        this.fileDiff = [];
        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, true).subscribe((line: string) => {
                this.fileDiff.push(line);
            });
    }
}

