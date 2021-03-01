import { Component, Input, OnInit } from "@angular/core";
import { IStatus } from "app/lib/Git/IStatus";
import { existsSync } from "fs";

import { Repository } from "../../lib/Git/Impl/Repository";
import { RepositoryService } from "../../services/repository.service";

@Component({
    selector: "app-commit",
    templateUrl: "./commit.component.html",
    styleUrls: ["./commit.component.css"],
})
export class CommitComponent {


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
    ) {
        this.commitMessage = "";
        this.pushOnCommit = true;
    }

    public async commit() {
        await this.getRepository().commit(this.commitMessage);
        this.commitMessage = "";
        if (this.pushOnCommit) {
            await this.getRepository().pushOrigin();
        }
    }

    public async onStatusSelect(status: IStatus | undefined): Promise<void> {
        if (status === undefined) {
            this.clearSelectedStatus();
            return;
        }
        if (status.indexed) {
            await this.selectIndexedStatus(status);
        } else {
            await this.selectStatus(status);
        }
    }

    private async selectIndexedStatus(status: IStatus): Promise<void> {

        if (!existsSync(status.path)) {
            // TODO: Add diff for deleted files
            // For now ignore deleted files
            this.clearSelectedStatus();
            return;
        }

        const lines: string[] = await this.repositoryService
            .getRepository(this.getRepository().path)
            .diff(status.path, true);

        this.fileDiff = {
            status,
            lines,
        };
    }

    private async selectStatus(status: IStatus) {

        if (!existsSync(status.path)) {
            // TODO: Add diff for deleted files
            // For now ignore deleted files
            this.clearSelectedStatus();
            return;
        }

        const repository: Repository = this.getRepository();
        const lines: string[] = await repository.diff(status.path, false);

        this.fileDiff = {
            status,
            lines,
        };
    }

    private clearSelectedStatus() {
        this.fileDiff = undefined;
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }
}
