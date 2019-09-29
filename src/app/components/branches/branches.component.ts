import { Component, Input, OnInit } from "@angular/core";

import { Repository } from "../../lib/Repository";
import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-branches",
    templateUrl: "./branches.component.html",
    styleUrls: ["./branches.component.css"],
})
export class BranchesComponent implements OnInit {

    public newBranch: {
        name: string;
    };

    @Input()
    public repository?: Repository;

    public showModal: boolean = false;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {
        this.newBranch = {
            name: "",
        };
    }

    public contextMenu(branch: string) {

        this.contextMenuBuilderService.show({
            Checkout: () => this.switchBranch(branch),
            Merge: () => this.merge(branch),
            Delete: () => this.deleteBranch(branch),
        });
    }

    public createBranch() {
        const branchName: string = this.newBranch.name;

        this.getRepository().branch(branchName).then(() => {

            // Hide modal
            this.showModal = false;

            // Reset
            this.newBranch = {
                name: "",
            };

        });
    }

    public displayModal() {
        this.showModal = true;
    }

    public hideModal() {
        this.showModal = false;
    }

    public ngOnInit() {
    }

    public switchBranch(branch: string) {

        return this.getRepository().checkout(branch);
    }

    private deleteBranch(branch: string) {

        return this.getRepository().deleteBranch(branch);
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

    private merge(branch: string) {

        return this.getRepository().merge(branch);
    }
}
