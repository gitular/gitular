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
                    this.repository.push();
                }
            });
        this.commitMessage = '';
    }
}
