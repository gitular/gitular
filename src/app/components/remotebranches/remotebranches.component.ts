import { Component, Input } from "@angular/core";

import { GitRepository } from "../../lib/Git/Impl/GitRepository";
import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-remotebranches",
    templateUrl: "./remotebranches.component.html",
})
export class RemoteBranchesComponent {

    @Input()
    public repository?: GitRepository;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) { }

    public async checkoutRemote(remoteBranch: string): Promise<void> {
        return this.getRepository().checkoutRemote(remoteBranch);
    }

    public contextMenu(remoteBranch: string): void {

        this.contextMenuBuilderService.show({
            "Checkout as local branch": () => this.checkoutRemote(remoteBranch),
            "Pull remote": () => this.pullRemote(remoteBranch),
            "Merge": () => this.merge(remoteBranch),
            "Set as upstream": () => this.setUpstream(remoteBranch),
            "Delete": () => this.deleteRemote(remoteBranch),
        });
    }

    public async deleteRemote(remoteBranch: string): Promise<void> {
        return this.getRepository().deleteRemoteBranch(remoteBranch);
    }

    private getRepository(): GitRepository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

    private merge(branch: string): Promise<void> {

        return this.getRepository().merge(branch);
    }

    private pullRemote(remoteBranch: string): Promise<string[]> {
        return this.getRepository().pullRemote(remoteBranch);
    }

    private setUpstream(remoteBranch: string): Promise<string[]> {
        return this.getRepository().setUpstream(remoteBranch);
    }

}
