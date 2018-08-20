import {Component, OnInit, Input} from '@angular/core';
import {Repository} from '../../lib/Repository';
import {ContextMenuBuilderService} from '../../services/context-menu-builder.service';

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

    public constructor(
        private contextMenuBuilderService: ContextMenuBuilderService
    ) {}

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

    private merge(branch: string) {

        return this.repository.merge(branch);
    }

    private deleteBranch(branch: string) {

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

    public contextMenu(branch: string) {

        this.contextMenuBuilderService.show({
            'Checkout': () => this.switchBranch(branch),
            'Merge': () => this.merge(branch),
            'Delete': () => this.deleteBranch(branch),
        });
    }
}
