import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
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

    @Input()
    public searchText: string;

    private allBookmarks?: IBookmark[];

    public constructor(
        private readonly bookmarksService: BookmarksService,
    ) {
        this.searchText = "";
    }

    public chooser() {
        const chosen: Promise<Electron.OpenDialogReturnValue> = remote.dialog.showOpenDialog({
            properties: ["openDirectory", "multiSelections"],
        });

        chosen.then((returnValue: Electron.OpenDialogReturnValue) => {
            for (const file of returnValue.filePaths) {
                this.bookmarksService.add(file);
            }
        });

    }

    public filterBookmarks(searchText: string): void {
        if (searchText.length < 1) {
            this.bookmarks = this.allBookmarks;
        } else {
            this.bookmarks = this.allBookmarks.filter((value: IBookmark) => {
                return value.name.indexOf(searchText) >= 0
                    && value.path.indexOf(searchText) >= 0;
            });
        }

    }

    public ngOnInit() {
        this.bookmarksService.update.subscribe(() => {
            this.allBookmarks = this.bookmarksService.getBookmarks();
            this.filterBookmarks(this.searchText);
        });
        this.bookmarksService.fetch();
    }

    public remove(bookmarkId: string): void {
        this.bookmarksService.remove(+bookmarkId);
    }

}
