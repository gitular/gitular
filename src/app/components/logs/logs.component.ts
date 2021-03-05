import { Component, Input } from "@angular/core";
import { ILog } from "../../lib/Git/ILog";
import { Repository } from "../../lib/Git/Impl/Repository";

import { RepositoryService } from "../../services/repository.service";

@Component({
    selector: "app-logs",
    templateUrl: "./logs.component.html",
    styleUrls: ["./logs.component.css"],
})
export class LogsComponent {

    public activeLog: ILog | undefined;

    public commitInfo: string[] = [];

    @Input()
    public repository: Repository;

    public constructor(
        private readonly repositoryService: RepositoryService,
    ) {}

    public selectLog(log: ILog) {

        if (log === this.activeLog) {
            this.activeLog = undefined;
            this.commitInfo = [];

            return;
        }

        this.activeLog = log;
        this.repositoryService
            .getRepository(this.repository.path)
            .commitInfo(log.commit)
            .then((lines: string[]) => {
                this.commitInfo = lines;
            });
    }


}
