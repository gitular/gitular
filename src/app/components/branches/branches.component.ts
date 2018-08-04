import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {RepositoryService} from '../../services/repository.service';

@Component({
    selector: 'app-branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit {

    @Input()
    path: string;

    branches: string[] = [];
    activeBranch: string;

    showModal: boolean = false;

    newBranch: {
        name: string;
    }

    constructor(
        private repositoryService: RepositoryService
    ) {}

    public ngOnInit() {

        this.refresh();

        this.newBranch = {
            name: ''
        }
    }

    private refresh() {

        this.repositoryService
            .getRepository(this.path)
            .getBranches()
            .subscribe((branches: string[]) => {

                let activeBranchName: string = '';
                for (let i = 0; i < branches.length; i++) {
                    if (branches[i].startsWith('* ')) {
                        activeBranchName = branches[i].substring(2);
                        branches[i] = activeBranchName;
                    }
                }
                this.activeBranch = activeBranchName;
                this.branches = branches;
            });
    }

    public displayModal() {
        this.showModal = true;
    }

    public hideModal() {
        this.showModal = false;
    }

    public switchBranch(branch: string) {

        return this.repositoryService.getRepository(this.path).checkout(branch)
            .then(() => {
                this.refresh();
            });
    }
    public deleteBranch(branch: string) {

        return this.repositoryService.getRepository(this.path).deleteBranch(branch)
            .then(() => {
                this.refresh();
            });
    }

    public createBranch() {
        const branchName: string = this.newBranch.name;

        this.repositoryService.getRepository(this.path).branch(branchName).then(() => {

            // Hide modal
            this.showModal = false;

            // Reset
            this.newBranch = {
                name: ''
            }

            this.refresh();
        });
    }
}
