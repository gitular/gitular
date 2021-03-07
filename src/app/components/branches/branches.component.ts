import { Component, Input, OnInit } from "@angular/core";
import { IBranch } from "app/lib/Git/IBranch";

import { GitRepository } from "../../lib/Git/Impl/GitRepository";
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
    public repository?: GitRepository;

    public showModal: boolean = false;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {
        this.newBranch = {
            name: "",
        };
    }

    public contextMenu(branch: IBranch) {

        this.contextMenuBuilderService.show({
            Checkout: () => this.switchBranch(branch.name),
            Merge: () => this.merge(branch.name),
            Delete: () => this.deleteBranch(branch.name),
            Pull: () => this.pullBranch(branch.name),
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

    public pullBranch(branch: string) {

        return this.getRepository().pull(branch);
    }

    private deleteBranch(branch: string) {

        return this.getRepository().deleteBranch(branch);
    }

    private getRepository(): GitRepository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

    private merge(branch: string) {

        return this.getRepository().merge(branch);
    }
}
