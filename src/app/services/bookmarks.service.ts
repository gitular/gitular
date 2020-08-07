import { EventEmitter, Injectable, Output } from "@angular/core";
import * as fs from "fs";

import { IBookmark } from "../lib/IBookmark";
import { IBranch } from "../lib/IBranch";
import { IStatus } from "../lib/IStatus";
import { RepositoryUtility } from "../lib/RepositoryUtility";
import { BasenamePipe } from "../pipes/basename.pipe";

@Injectable({
    providedIn: "root",
})
export class BookmarksService {

    private static readonly DB_BOOKMARKS = "bookmarks.json";

    @Output()
    public update: EventEmitter<IBookmark[]> = new EventEmitter<IBookmark[]>();

    private bookmarks: IBookmark[] = undefined;

    public add(path: string) {
        this.fetch();

        this.bookmarks.push({
            name: BasenamePipe.baseName(path),
            id: this.getMaxId() + 1,
            path,
        });

        this.save();
    }

    public fetch(): void {
        if (this.bookmarks == undefined) {
            const bookmarks: object | undefined = this.read(BookmarksService.DB_BOOKMARKS);

            if (bookmarks === undefined) {
                this.bookmarks = [];
            } else {
                this.bookmarks = bookmarks as IBookmark[];

                this.bookmarks = this.bookmarks.filter((bookmark: IBookmark) => {
                    return fs.existsSync(bookmark.path);
                });

                for (const bookmark of this.bookmarks) {
                    const repositoryUtility = new RepositoryUtility(bookmark.path);
                    repositoryUtility.getStatus().subscribe((statuses: IStatus[]) => {
                        bookmark.statuses = statuses;
                    });
                    repositoryUtility.fetchBranches().subscribe((branches: IBranch[]) => {
                        for (const branch of branches) {
                            if (branch.active) {
                                bookmark.branch = branch.name;
                                break;
                            }
                        }
                    });
                }
            }
            this.notifySubscribers();
        }
    }

    public getBookmarkById(id: number): IBookmark {
        this.fetch();

        for (const item of this.bookmarks) {
            if (item.id === id) {
                return item;
            }
        }

        return undefined;
    }
    public getBookmarkIndexById(id: number): number | undefined {
        this.fetch();

        for (let index = 0; index < this.bookmarks.length; index++) {
            const item = this.bookmarks[index];
            if (item.id === id) {
                return index;
            }
        }

        return undefined;
    }

    public getBookmarks(): IBookmark[] {
        this.fetch();

        return this.bookmarks;
    }
    public remove(id: number) {
        this.fetch();

        this.bookmarks = this.bookmarks.filter((value: IBookmark) => {
            return value.id !== id;
        });
        this.save();
    }

    private getMaxId() {
        let maxId = 0;
        for (const bookmark of this.getBookmarks()) {
            if (bookmark.id > maxId) {
                maxId = bookmark.id;
            }
        }

        return maxId;
    }

    private notifySubscribers(): void {
        this.update.emit(this.bookmarks);
    }

    private read(item: string): object | undefined {
        const stringValue: string | null = localStorage.getItem(item);
        if (stringValue === null) {
            return undefined;
        }

        return JSON.parse(stringValue);
    }

    private save() {
        this.write(
            BookmarksService.DB_BOOKMARKS,
            this.bookmarks,
        );

        // Refetch
        this.bookmarks = undefined;
        this.fetch();
    }

    private write(item: string, value: object) {
        const stringValue: string = JSON.stringify(value);

        localStorage.setItem(item, stringValue);
    }
}
