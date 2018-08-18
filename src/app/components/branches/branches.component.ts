import {Component, OnInit, Input} from '@angular/core';
import {Repository} from '../../lib/Repository';
import {remote} from 'electron';

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

    public merge(branch: string) {

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

    contextMenu(branch: string) {
        const menu = new remote.Menu();

        menu.append(new remote.MenuItem({
            label: 'Checkout',
            click: () => {
                this.switchBranch(branch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Merge',
            click: () => {
                this.merge(branch);
            }
        }));
        menu.append(new remote.MenuItem({
            label: 'Delete',
            click: () => {
                this.deleteBranch(branch);
            }
        }));
        menu.popup({
            window: remote.BrowserWindow.getFocusedWindow()
        });
    }
}
