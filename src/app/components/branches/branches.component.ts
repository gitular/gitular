import {Component, OnInit, Input} from '@angular/core';
import {RepositoryService} from '../../services/repository.service';
import {Repository} from '../../lib/Repository';

@Component({
    selector: 'app-branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.css']
})
export class BranchesComponent implements OnInit {

    @Input()
    repository: Repository;

    showModal: boolean = false;

    newBranch: {
        name: string;
    }

    public ngOnInit() {

        this.newBranch = {
            name: ''
        }
    }


    public displayModal() {
        this.showModal = true;
    }

    public hideModal() {
        this.showModal = false;
    }

    public switchBranch(branch: string) {

        return this.repository.checkout(branch);
    }
    public deleteBranch(branch: string) {

        return this.repository.deleteBranch(branch);
    }

    public createBranch() {
        const branchName: string = this.newBranch.name;

        this.repository.branch(branchName).then(() => {

            // Hide modal
            this.showModal = false;

            // Reset
            this.newBranch = {
                name: ''
            }

        });
    }
}
