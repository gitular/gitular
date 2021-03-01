import { Component, Input, OnInit } from "@angular/core";
import { IStatus } from "app/lib/Git/IStatus";
import { existsSync, Stats } from "fs";

import { Repository } from "../../lib/Git/Impl/Repository";
import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";
import { RepositoryService } from "../../services/repository.service";

@Component({
    selector: "app-commit",
    templateUrl: "./commit.component.html",
    styleUrls: ["./commit.component.css"],
})
export class CommitComponent implements OnInit {

    public activeStatus?: IStatus;

    public commitMessage: string;

    public fileDiff: {
        lines: string[];
        status: IStatus;
    } | undefined = undefined;

    public pushOnCommit: boolean;

    @Input()
    public repository?: Repository;

    public constructor(
        private readonly repositoryService: RepositoryService,
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {
        this.commitMessage = "";
        this.pushOnCommit = true;
    }

    public add(path: string) {
        return this.getRepository().add(path);
    }

    public commit() {
        this.getRepository()
            .commit(this.commitMessage)
            .then(() => {
                if (this.pushOnCommit) {
                    this.getRepository().pushOrigin();
                }
            });
        this.commitMessage = "";
    }

    public contextMenu(status: IStatus) {

        if (!status.indexed) {
            this.contextMenuBuilderService.show({
                Index: () => this.add(status.path),
                Discard: () => this.discard(status.path),
            });
        } else {
            this.contextMenuBuilderService.show({
                Reset: () => this.reset(status.path),
            });
        }
    }

    public discard(path: string) {
        return this.getRepository().discardChanges(path);
    }

    public ngOnInit() {
    }

    public reset(path: string) {
        return this.getRepository().reset(path);
    }

    public async selectIndexedStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.clearSelectedStatus();
            return;
        }
        if (!existsSync(status.path)) {
            // TODO: Add diff for deleted files
            // For now ignore deleted files
            this.clearSelectedStatus();
            return;
        }

        const lines: string[] = await this.repositoryService
            .getRepository(this.getRepository().path)
            .diff(status.path, true);

        this.activeStatus = status;
        this.fileDiff = {
            status,
            lines,
        };
    }

    public async selectStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.clearSelectedStatus();
            return;
        }
        if (!existsSync(status.path)) {
            // TODO: Add diff for deleted files
            // For now ignore deleted files
            this.clearSelectedStatus();
            return;
        }

        const repository: Repository = this.getRepository();
        const lines: string[] = await repository.diff(status.path, false);

        this.activeStatus = status;
        this.fileDiff = {
            status,
            lines,
        };
    }

    private clearSelectedStatus() {
        this.activeStatus = undefined;
        this.fileDiff = undefined;
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }
}
