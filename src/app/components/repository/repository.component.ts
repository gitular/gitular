import {Component, OnInit} from '@angular/core';
import {BookmarksService} from '../../services/bookmarks.service';
import {RepositoryService} from '../../services/repository.service';
import {ActivatedRoute} from "@angular/router";
import {Title} from '@angular/platform-browser';
import {Repository} from '../../lib/Repository';

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


    constructor(
        private titleService: Title,
        private bookmarksService: BookmarksService,
        private repositoryService: RepositoryService,
        private route: ActivatedRoute
    ) {
        this.id = +this.route.snapshot.params['id'];
    }

    ngOnInit() {

        const bookmark = this.bookmarksService.getBookmarkById(this.id);

        this.path = bookmark.path;
        this.titleService.setTitle(bookmark.name)

        this.repository = this.repositoryService.getRepository(this.path);

        this.repository.fetchTags();
        this.repository.fetchRemoteBranches();
        this.repository.fetchLogs();

    }
    
    viewChange(ev) {
        this.repository.preferences.view = ev;
    }
}
