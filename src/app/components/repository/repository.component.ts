import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {BookmarksService} from '../../services/bookmarks.service';
import {RepositoryService} from '../../services/repository.service';
import {ActivatedRoute} from "@angular/router";
import {Title} from '@angular/platform-browser';
import {Repository} from '../../lib/Repository';
import {ExecInfo} from '../../lib/ExecInfo';

@Component({
    selector: 'app-repository',
    templateUrl: './repository.component.html',
    styleUrls: ['./repository.component.css'],
    providers: [BookmarksService]
})
export class RepositoryComponent implements OnInit {
    title = 'Gitular';

    path: string;

    repository: Repository;
    id: number;

    logs: ExecInfo[];


    constructor(
        private titleService: Title,
        private bookmarksService: BookmarksService,
        private repositoryService: RepositoryService,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
    ) {
        this.id = +this.route.snapshot.params['id'];
        this.logs = [];
    }

    ngOnInit() {

        const bookmark = this.bookmarksService.getBookmarkById(this.id);

        this.path = bookmark.path;
        this.titleService.setTitle(bookmark.name)

        this.repository = this.repositoryService.getRepository(this.path);
        this.repository.logEvents.subscribe((log: ExecInfo) => {
            if (!log.success) {
                this.logs.push(log);
                this.ref.detectChanges();
                console.log(JSON.stringify(log));
            }
        });

        this.repository.fetchRemoteInfo();
        this.repository.fetchLocalInfo();
    }

    viewChange(ev) {
        this.repository.preferences.view = ev;
    }

    hideModal() {
        this.logs = [];
    }
}
