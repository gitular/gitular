import {Component, OnInit} from '@angular/core';
import {BookmarksService} from '../../services/bookmarks.service';
import {IBookmark} from '../../lib/IBookmark';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    providers: [BookmarksService]
})
export class HomeComponent implements OnInit {

    bookmarks: Array<IBookmark>;
    newRepository: string;

    constructor(
        private bookmarksService: BookmarksService,
    ) {}

    ngOnInit() {
        this.bookmarks = this.bookmarksService.getBookmarks();
        this.bookmarksService.update.subscribe(() => {
            this.bookmarks = [];
            this.bookmarks = this.bookmarksService.getBookmarks();
        })
    }

    remove(bookmarkId: string) {
        this.bookmarksService.remove(+bookmarkId);
    }

    addRepository() {
        if (this.newRepository === '') {
            return;
        }

        const newRepository: string = this.newRepository;
        this.newRepository = '';
        this.bookmarksService.add(newRepository);
    }
}
