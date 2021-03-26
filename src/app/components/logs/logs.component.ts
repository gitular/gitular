import { Component, Input } from "@angular/core";
import { ILog } from "../../lib/Git/ILog";
import { GitRepository } from "../../lib/Git/Impl/GitRepository";

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
    public repository: GitRepository;

    public async selectLog(log: ILog): Promise<void> {

        if (log === this.activeLog) {
            // Deselect
            this.activeLog = undefined;
            this.commitInfo = [];

            return;
        }
        this.activeLog = log;

        // TODO: consider adding a loading icon on log item
        // Lookup
        const lines: string[] = await this.repository.commitInfo(log.commit);

        this.commitInfo = lines;
    }


}
