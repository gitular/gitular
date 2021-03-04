import { EventEmitter, Injectable, InjectionToken, Output } from "@angular/core";
import { ExecUtil } from "app/lib/Exec/ExecUtil";
import { RepositoryFactory } from "app/lib/Git/Impl/RepositoryFactory";
import * as fs from "fs";
import { IBookmark } from "../lib/Git/IBookmark";
import { IBranch } from "../lib/Git/IBranch";
import { BasenamePipe } from "../pipes/basename.pipe";
import { LocalStorageService } from "./LocalStorageService";

@Injectable({
    providedIn: "root",
})
export class BookmarksService {

    private static readonly DB_BOOKMARKS = "bookmarks.json";

    @Output()
    public update: EventEmitter<IBookmark[]> = new EventEmitter<IBookmark[]>();

    private bookmarks: IBookmark[] = undefined;


    public constructor(
        private readonly dataStore: LocalStorageService<IBookmark[]>
    ) { }

    public add(path: string) {
        this.fetch(false);

        this.bookmarks.push({
            name: BasenamePipe.baseName(path),
            id: this.getMaxId() + 1,
            path,
        });

        this.save(BookmarksService.DB_BOOKMARKS, this.bookmarks);
        this.fetch(true);
    }

    public async fetch(force: boolean = false): Promise<void> {
        if (force || this.bookmarks == undefined) {
            const bookmarks: IBookmark[] = this.dataStore.read(BookmarksService.DB_BOOKMARKS);

            if (bookmarks === undefined) {
                this.bookmarks = [];
            } else {
                this.bookmarks = bookmarks as IBookmark[];

                // Only fetch repo's that exist
                this.bookmarks = this.bookmarks.filter((bookmark: IBookmark) => {
                    return fs.existsSync(bookmark.path);
                });

                for (const bookmark of this.bookmarks) {
                    const repositoryFactory: RepositoryFactory = new RepositoryFactory(new ExecUtil());
                    const repositoryUtility = repositoryFactory.createUtility(bookmark.path);

                    bookmark.statuses = await repositoryUtility.getStatus();

                    const branch: IBranch | undefined = (await repositoryUtility.fetchBranches()).find((branch) => {
                        return branch.active;
                    });
                    if (branch !== undefined) {
                        bookmark.branch = branch.name;
                    }
                }
            }
            this.notifySubscribers();
        }
    }

    public getBookmarkById(id: number): IBookmark {
        this.fetch(false);

        for (const item of this.bookmarks) {
            if (item.id === id) {
                return item;
            }
        }

        return undefined;
    }

    public getBookmarkIndexById(id: number): number | undefined {
        this.fetch(false);

        for (let index = 0; index < this.bookmarks.length; index++) {
            const item = this.bookmarks[index];
            if (item.id === id) {
                return index;
            }
        }

        return undefined;
    }

    public getBookmarks(): IBookmark[] {
        this.fetch(false);

        return this.bookmarks;
    }

    public remove(id: number) {
        this.fetch(false);

        this.bookmarks = this.bookmarks.filter((value: IBookmark) => {
            return value.id !== id;
        });
        this.save(BookmarksService.DB_BOOKMARKS, this.bookmarks);
        this.fetch(true);
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


    private save(id: string, data: IBookmark[]) {
        this.dataStore.write(
            id,
            data,
        );
    }
}
