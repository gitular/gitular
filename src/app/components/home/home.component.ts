import {Component, OnInit} from '@angular/core';
import {BookmarksService} from '../../services/bookmarks.service';
import {IBookmark} from '../../lib/IBookmark';
import {remote} from 'electron';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    providers: [BookmarksService]
})
export class HomeComponent implements OnInit {

    bookmarks: Array<IBookmark>;

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
    
    chooser() {
        const chosen: string[] = remote.dialog.showOpenDialog({
            properties: ['openDirectory', 'multiSelections']
        });
        
        for (let file of chosen) {
            this.bookmarksService.add(file);
        }   
    }
}
