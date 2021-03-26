import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { FileStatusI } from "../../lib/Git/FileStatusI";
import { ChangeStatusI } from "../../lib/Git/ChangeStatusI";
import { ViewType } from "../../lib/Git/ViewType";
import { BookmarksService } from "../../services/bookmarks.service";
import { RepositoryService } from "../../services/repository.service";
import { GitRepository } from "../../lib/Git/Impl/GitRepository";

@Component({
    selector: "app-repository",
    templateUrl: "./repository.component.html",
    styleUrls: ["./repository.component.css"],
    providers: [],
})
export class RepositoryComponent implements OnInit {

    public readonly id: number;

    public path?: string;

    public repository?: GitRepository;

    public readonly title: string = "Gitular";

    public diff: string[] | undefined = undefined;

    public selectedStatus: ChangeStatusI | undefined;

    public constructor(
        private readonly titleService: Title,
        private readonly bookmarksService: BookmarksService,
        private readonly repositoryService: RepositoryService,
        private readonly route: ActivatedRoute
    ) {
        this.id = +this.route.snapshot.params.id;
    }

    public ngOnInit(): void {

        const bookmark = this.bookmarksService.getBookmarkById(this.id);

        this.path = bookmark.path;
        this.titleService.setTitle(bookmark.name);

        this.repository = this.repositoryService.getRepository(this.path);

        this.repository.fetchRemoteInfo();
        this.repository.fetchLocalInfo();
    }

    public viewChange(ev: ViewType): void {
        this.getRepository().preferences.view = ev;
    }

    private getRepository(): GitRepository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }

    public async onStatusSelect(status: ChangeStatusI | undefined): Promise<void> {
        if (status === undefined) {
            this.diff = undefined;
            this.selectedStatus = undefined;
            return;
        }
        this.selectedStatus = status;

        const diffStatus: FileStatusI = status.status;
        console.log(status);

        if (diffStatus === FileStatusI.DELETED) {
            this.diff = await this.repository.diff({ staged: status.indexed, }, ['HEAD', '--', status.path]);
            return;
        }

        this.diff = await this.repository.diff({ staged: status.indexed, }, [status.path]);
    }
}
