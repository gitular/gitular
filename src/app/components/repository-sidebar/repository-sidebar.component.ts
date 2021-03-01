import { Component, Input, OnInit } from "@angular/core";
import { Repository } from "app/lib/Git/Impl/Repository";
import { ViewType } from "app/lib/Git/ViewType";

import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-repository-sidebar",
    templateUrl: "./repository-sidebar.component.html",
    styleUrls: ["./repository-sidebar.component.css"],
})
export class RepositorySidebarComponent implements OnInit {

    @Input()
    public repository?: Repository;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {

    }

    public fetch() {
        this.getRepository().fetch();
    }

    public logs() {
        this.getRepository().fetchRemoteInfo();
        this.getRepository().preferences.view = ViewType.LOGS;
    }

    public logsContextMenu() {
        this.contextMenuBuilderService.show({
            Refresh: () => this.getRepository().fetchRemoteInfo(),
        });
    }

    public ngOnInit(
    ) {
    }

    public pull() {
        this.getRepository().pull();
    }

    public push() {
        this.getRepository().pushOrigin();
    }

    public refreshLocal() {
        this.getRepository().fetchLocalInfo();
    }

    public workingCopy() {
        this.getRepository().fetchLocalInfo();
        this.getRepository().preferences.view = ViewType.WORKING_COPY;
    }

    public workingCopyContextMenu() {
        this.contextMenuBuilderService.show({
            Refresh: () => this.getRepository().fetchLocalInfo(),
        });
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

}
