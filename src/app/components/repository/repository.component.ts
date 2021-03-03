import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { FileStatus } from "app/lib/Git/FileStatus";
import { ChangeStatus } from "app/lib/Git/IRepository";
import { ViewType } from "app/lib/Git/ViewType";
import { ExecInfo } from "../../lib/Exec/ExecInfo";
import { Repository } from "../../lib/Git/Impl/Repository";
import { BookmarksService } from "../../services/bookmarks.service";
import { RepositoryService } from "../../services/repository.service";

@Component({
    selector: "app-repository",
    templateUrl: "./repository.component.html",
    styleUrls: ["./repository.component.css"],
    providers: [BookmarksService],
})
export class RepositoryComponent implements OnInit {

    public readonly id: number;

    public logs: ExecInfo[];

    public path?: string;

    public repository?: Repository;

    public readonly title: string = "Gitular";

    public diff: string[] | undefined = undefined;

    public selectedStatus: ChangeStatus | undefined;

    public constructor(
        private readonly titleService: Title,
        private readonly bookmarksService: BookmarksService,
        private readonly repositoryService: RepositoryService,
        private readonly route: ActivatedRoute,
        private readonly ref: ChangeDetectorRef,
    ) {
        this.id = +this.route.snapshot.params.id;
        this.logs = [];
    }

    public hideModal() {
        this.logs = [];
    }

    public ngOnInit() {

        const bookmark = this.bookmarksService.getBookmarkById(this.id);

        this.path = bookmark.path;
        this.titleService.setTitle(bookmark.name);

        this.repository = this.repositoryService.getRepository(this.path);
        this.repository.subscribe((log: ExecInfo) => {
            if (!log.success) {
                this.logs.push(log);
                this.ref.detectChanges();
                console.log(JSON.stringify(log));
            }
        });

        this.repository.fetchRemoteInfo();
        this.repository.fetchLocalInfo();
    }

    public viewChange(ev: ViewType) {
        this.getRepository().preferences.view = ev;
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

    public async onStatusSelect(status: ChangeStatus | undefined): Promise<void> {
        if (status === undefined) {
            this.diff = undefined;
            this.selectedStatus = undefined;
            return;
        }
        this.selectedStatus = status;

        console.log(status);

        if (status.status == FileStatus.DELETED) {
            // TODO: Add diff for deleted files
            this.diff = await (await this.repository.show(`HEAD^:${status.path}`)).map((line: string) => {
                return '- ' + line;
            });
            return;
        }

        this.diff = await this.repository.diff(status.path, status.indexed);
    }
}
