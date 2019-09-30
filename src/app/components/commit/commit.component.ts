import { Component, Input, OnInit } from "@angular/core";

import { IStatus } from "../../lib/IStatus";
import { Repository } from "../../lib/Repository";
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

    public selectIndexedStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = undefined;

            return;
        }

        this.repositoryService
            .getRepository(this.getRepository().path)
            .diff(status.path, true)
            .toPromise()
            .then((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = {
                    status,
                    lines,
                };
            });
    }

    public selectStatus(status: IStatus) {

        if (status === this.activeStatus) {
            this.activeStatus = undefined;
            this.fileDiff = undefined;

            return;
        }

        this.repositoryService
            .getRepository(this.getRepository().path)
            .diff(status.path, false).subscribe((lines: string[]) => {
                this.activeStatus = status;
                this.fileDiff = {
                    status,
                    lines,
                };
            });
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }
}
