import {Injectable, Output, EventEmitter} from '@angular/core';
import {BasenamePipe} from '../pipes/basename.pipe';
import {RepositoryUtility, IStatus} from "../lib/RepositoryUtility";
import {IBookmark} from "../lib/IBookmark";

@Injectable({
    providedIn: "root",
})
export class BookmarksService {


    @Output()
    update: EventEmitter<string> = new EventEmitter<string>();

    private static readonly DB_BOOKMARKS = 'bookmarks.json';


    private bookmarks: IBookmark[] = undefined;

    constructor() {
    }


    private fetch() {
        if (this.bookmarks == undefined) {
            const bookmarks: object | undefined = this.read(BookmarksService.DB_BOOKMARKS);

            if (bookmarks === undefined) {
                this.bookmarks = [];
            } else {
                this.bookmarks = bookmarks as IBookmark[];
                for (const bookmark of this.bookmarks) {
                    const repositoryUtility = new RepositoryUtility(bookmark.path);
                    repositoryUtility.getStatus().subscribe((statuses: IStatus[]) => {
                        bookmark.statuses = statuses;
                    });
                }
            }
        }
    }


    public getBookmarks(): Array<IBookmark> {
        this.fetch();
        return this.bookmarks;
    };

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

    public remove(id: number) {
        this.fetch();

        this.bookmarks = this.bookmarks.filter((value: IBookmark)=>{
            return value.id !== id;
        });
        this.save();
    }

    public add(path: string) {
        this.fetch();

        this.bookmarks.push({
            name: BasenamePipe.baseName(path),
            id: this.getMaxId() + 1,
            path
        });

        this.save();
    }

    private save() {
        this.write(
            BookmarksService.DB_BOOKMARKS,
            this.bookmarks
        );

        this.bookmarks = undefined;
        this.update.emit();
    }

    private write(item: string, value: object) {
        const stringValue: string = JSON.stringify(value);

        localStorage.setItem(item, stringValue);
    }
    private read(item: string): object | undefined {
        const stringValue: string | null = localStorage.getItem(item);
        if (stringValue === null) {
            return undefined;
        }
        return JSON.parse(stringValue);
    }

    private getMaxId() {
        let maxId = 0;
        for (let bookmark of this.getBookmarks()) {
            if (bookmark.id > maxId) {
                maxId = bookmark.id;
            }
        }

        return maxId;
    }
}
