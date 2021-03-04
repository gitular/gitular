import { Component, Input, OnInit } from "@angular/core";
import { remote, shell } from "electron";

import { IBookmark } from "../../lib/Git/IBookmark";
import { BookmarksService } from "../../services/bookmarks.service";
import { ContextMenuBuilderService } from "app/services/context-menu-builder.service";
import { spawn, ChildProcess } from "child_process";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    providers: [],
})
export class HomeComponent implements OnInit {

    public bookmarks?: IBookmark[];

    @Input()
    public searchText: string;

    private allBookmarks?: IBookmark[];

    public constructor(
        private readonly bookmarksService: BookmarksService,
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {
        this.searchText = "";
    }

    public contextMenu(bookmark: IBookmark) {

        this.contextMenuBuilderService.show({
            Delete: () => this.remove(bookmark),
            'Open in OS': () => this.openFolder(bookmark),
            'Open Terminal': () => this.openTerminal(bookmark),
        });
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

    public remove(bookmark: IBookmark): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.bookmarksService.remove(+bookmark.id);
            resolve(true);
        });
    }
    public openFolder(bookmark: IBookmark): Promise<boolean> {
        return new Promise((resolve, reject) => {
            shell.openExternal('file://' + bookmark.path);
            resolve(true);
        });
    }

    public openTerminal(bookmark: IBookmark): Promise<boolean> {
        return new Promise((resolve, reject) => {

            let terminal: string | undefined = undefined;

            switch (process.platform) {
                case "win32":
                    terminal = 'start cmd.exe';
                    break;
                case "linux":
                    terminal = 'gnome-terminal';

                    break;
                case "darwin":
                    // TODO:8
                    console.log("Terminal open not implemented yet");
                    return;
               default:
                    // TODO:
                    console.log(`Terminal open not suported for ${process.platform}`);
                    return;
            }

            let childProcess: ChildProcess = spawn(terminal, { cwd: bookmark.path });
            childProcess.on('error', reject);
            resolve(true);
        });
    }

}
