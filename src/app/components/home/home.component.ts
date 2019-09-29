import { Component, OnInit } from "@angular/core";
import { remote } from "electron";

import { IBookmark } from "../../lib/IBookmark";
import { BookmarksService } from "../../services/bookmarks.service";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    providers: [BookmarksService],
})
export class HomeComponent implements OnInit {

    public bookmarks?: IBookmark[];

    public constructor(
        private readonly bookmarksService: BookmarksService,
    ) {}

    public chooser() {
        const chosen: string[] = remote.dialog.showOpenDialog({
            properties: ["openDirectory", "multiSelections"],
        });

        for (const file of chosen) {
            this.bookmarksService.add(file);
        }
    }

    public ngOnInit() {
        this.bookmarks = this.bookmarksService.getBookmarks();
        this.bookmarksService.update.subscribe(() => {
            this.bookmarks = [];
            this.bookmarks = this.bookmarksService.getBookmarks();
        });
    }

    public remove(bookmarkId: string) {
        this.bookmarksService.remove(+bookmarkId);
    }
}
