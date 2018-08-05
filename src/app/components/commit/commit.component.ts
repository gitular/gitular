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
    }

    public refresh() {
        this.repository.fetchLocalInfo();
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

        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, false).subscribe((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = lines;
            });
    }

    selectIndexedStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = [];
            return;
        }

        this.repositoryService
            .getRepository(this.repository.path)
            .diff(status.path, true).subscribe((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = lines;
            });
    }
}

