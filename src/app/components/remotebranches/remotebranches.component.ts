import { Component, Input, OnInit } from "@angular/core";
import { remote } from "electron";

import { Repository } from "../../lib/Git/Impl/Repository";
import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-remotebranches",
    templateUrl: "./remotebranches.component.html",
    styleUrls: ["./remotebranches.component.css"],
})
export class RemotebranchesComponent implements OnInit {

    @Input()
    public repository?: Repository;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {}

    public checkoutRemote(remoteBranch: string) {
        return this.getRepository().checkoutRemote(remoteBranch);
    }

    public contextMenu(remoteBranch: string) {

        this.contextMenuBuilderService.show({
            "Checkout as local branch": () => this.checkoutRemote(remoteBranch),
            "Pull remote": () => this.pullRemote(remoteBranch),
            "Merge": () => this.merge(remoteBranch),
            "Set as upstream": () => this.setUpstream(remoteBranch),
            "Delete": () => this.deleteRemote(remoteBranch),
        });
    }

    public deleteRemote(remoteBranch: string) {
        return this.getRepository().deleteRemoteBranch(remoteBranch);
    }

    public ngOnInit() {
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

    private pullRemote(remoteBranch: string) {
        return this.getRepository().pullRemote(remoteBranch);
    }

    private setUpstream(remoteBranch: string) {
        return this.getRepository().setUpstream(remoteBranch);
    }

}
