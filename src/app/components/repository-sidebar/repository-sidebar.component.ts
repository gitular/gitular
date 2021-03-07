import { Component, Input } from "@angular/core";
import { GitRepository } from "../../lib/Git/Impl/GitRepository";
import { ViewType } from "../../lib/Git/ViewType";

import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-repository-sidebar",
    templateUrl: "./repository-sidebar.component.html",
})
export class RepositorySidebarComponent {

    @Input()
    public repository?: GitRepository;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) { }

    public fetch(): void {
        this.getRepository().fetch();
    }

    public logs(): void {
        this.getRepository().fetchRemoteInfo();
        this.getRepository().preferences.view = ViewType.LOGS;
    }

    public logsContextMenu(): void {
        this.contextMenuBuilderService.show({
            Refresh: () => this.getRepository().fetchRemoteInfo(),
        });
    }

    public pull(): void {
        this.getRepository().pull();
    }

    public push(): void {
        this.getRepository().pushOrigin();
    }

    public refreshLocal(): void {
        this.getRepository().fetchLocalInfo();
    }

    public workingCopy(): void {
        this.getRepository().fetchLocalInfo();
        this.getRepository().preferences.view = ViewType.WORKING_COPY;
    }

    public workingCopyContextMenu(): void {
        this.contextMenuBuilderService.show({
            Refresh: () => this.getRepository().fetchLocalInfo(),
        });
    }

    private getRepository(): GitRepository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

}
