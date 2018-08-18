import {Component, OnInit, Input, ChangeDetectorRef} from '@angular/core';
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

    public constructor(
        private ref: ChangeDetectorRef,
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

        return this.repository.checkout(branch).then(() => {
            this.ref.detectChanges();
        });
    }

    private merge(branch: string) {

        return this.repository.merge(branch).then(() => {
            this.ref.detectChanges();
        });
    }

    private deleteBranch(branch: string) {

        return this.repository.deleteBranch(branch).then(() => {
            this.ref.detectChanges();
        });
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
