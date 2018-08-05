import * as child_process from 'child_process';
import {Observable, Subscriber} from 'rxjs';
import {map, filter} from 'rxjs/operators';
import {ILog} from './ILog';
import {IRepository} from './IRepository';


export class RepositoryUtility {

    private static getLinesAsync(cmd: string, wd: string): Observable<string[]> {
        console.log(cmd);
        const observable: Observable<string[]> = Observable.create((observer: Subscriber<string[]>) => {
            child_process
                .exec(cmd, {
                    cwd: wd
                }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return;
                    }

                    const lines: Array<string> = stdout
                        .toString()
                        .split('\n');

                    const filterLines: string[] = lines.filter((v) => (v !== ''));
                    observer.next(filterLines);
                    observer.complete();
                });

        });

        return observable;

    }


    public static checkout(path: string, branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout ${branch}`, path).toPromise();
    }

    public static deleteBranch(path: string, branch: string): Promise<string[]> {

        return this.getLinesAsync(`git branch -d ${branch}`, path).toPromise();
    }

    public static branch(path: string, branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout -b ${branch}`, path).toPromise();
    }

    public static add(repositoryPath: string, path: string): Promise<string[]> {

        return this.getLinesAsync(`git add ${path}`, repositoryPath).toPromise();
    }

    public static reset(repositoryPath: string, path: string): Promise<string[]> {

        return this.getLinesAsync(`git reset HEAD ${path}`, repositoryPath).toPromise();
    }

    public static commit(repositoryPath: string, message: string): Promise<string[]> {

        return this.getLinesAsync(`git commit -m '${message}'`, repositoryPath).toPromise();
    }

    public static fetchBranches(path: string): Observable<string[]> {
        return this.getLinesAsync("git branch", path);
    }

    public static pushOrigin(path: string): Promise<string[]> {
        return this.getLinesAsync(`git push origin HEAD`, path).toPromise();
    }

    public static pull(path: string): Promise<string[]> {
        return this.getLinesAsync(`git pull`, path).toPromise();
    }

    public static fetch(path: string): Promise<string[]> {
        return this.getLinesAsync(`git fetch`, path).toPromise();
    }

    public static getTags(path: string): Observable<string[]> {
        return this.getLinesAsync("git tag", path);
    }

    public static getRemoteBranches(path: string): Observable<string[]> {
        return this.getLinesAsync("git branch -r", path);
    }

    public static getCommitInfo(path: string, commit: string): Observable<string[]> {
        return this.getLinesAsync(`git show '${commit}'`, path);
    }

    public static getDiff(repoPath: string, path: string, staged: boolean): Observable<string[]> {
        if (staged) {
            return this.getLinesAsync(`git diff --staged '${path}'`, repoPath);
        } else {
            return this.getLinesAsync(`git diff '${path}'`, repoPath);
        }
    }

    public static getLogs(path: string): Observable<ILog[]> {
        return this.getLinesAsync(`git log --format="%H %s <%ae> '%an' '%cr' '%d'"`, path)
            .pipe(map((lines: string[]) => {

                const logs: ILog[] = [];
                for (const line of lines) {
                    const regex: RegExp = /([0-9a-fA-F]{40}) (.*) <(.*)> '(.*)' '(.*)' '(.*)'/gm;
                    const result: RegExpMatchArray = regex.exec(line);
                    const commit: string = result[1];
                    const message: string = result[2];
                    const authorEmail: string = result[3];
                    const authorName: string = result[4];
                    const relativeDate: string = result[5];

                    let reflog: string = result[6].trim();
                    if (reflog.startsWith('(') && reflog.endsWith(')')) {
                        reflog = reflog.substring(1, reflog.length - 1);
                    }
                    const reflogs: string[] = reflog
                        .split(',')
                        .map((value: string) => {
                            return value.trim();
                        });

                    logs.push({
                        commit,
                        message,
                        authorEmail,
                        authorName,
                        relativeDate,
                    });
                }
                return logs;

            }));
    }

    public static getStatus(path: string): Observable<IStatus[]> {

        const copyRenameRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*) -> (.*)/;
        const statusLineRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*)/;;

        return this.getLinesAsync("git status -s", path).pipe(
            map((lines: string[]) => {

                const statuses: IStatus[] = [];

                for (const line of lines) {
                    const copyRenameResult: RegExpMatchArray = copyRenameRegex.exec(line);

                    if (copyRenameResult != undefined) {

                        statuses.push( this.createStatus(
                            copyRenameResult[1],
                            copyRenameResult[2],
                            copyRenameResult[4],
                            copyRenameResult[3]
                        ));
                    } else {
                        const result: RegExpMatchArray | null = statusLineRegex.exec(line);

                        if (result === null) {
                            throw new Error(`Failed to parse line '${line}'`);
                        }

                        statuses.push(this.createStatus(
                            result[1],
                            result[2],
                            result[3]
                        ));
                    }
                }
                return statuses;

            })
        );
    }

    private static createStatus(
        index: string,
        working: string,
        path: string,
        origPath?: string
    ): IStatus {
        const indexStatus: FileStatus = this.fileStatusFromString(index);
        const workingStatus: FileStatus = this.fileStatusFromString(working);

        return {
            indexed: (indexStatus !== FileStatus.UNMODIFIED)
                && (indexStatus !== FileStatus.UNTRACKED),
            local: (workingStatus !== FileStatus.UNMODIFIED),
            index: indexStatus,
            working: workingStatus,
            origPath,
            path,
        }
    }


    private static fileStatusFromString(str: string): FileStatus {
        switch (str) {
            case FileStatus.UNMODIFIED:
                return FileStatus.UNMODIFIED;
            case FileStatus.MODIFIED:
                return FileStatus.MODIFIED;
            case FileStatus.ADDED:
                return FileStatus.ADDED;
            case FileStatus.DELETED:
                return FileStatus.DELETED;
            case FileStatus.RENAMED:
                return FileStatus.RENAMED;
            case FileStatus.COPIED:
                return FileStatus.COPIED;
            case FileStatus.UPDATED:
                return FileStatus.UPDATED;
            case FileStatus.UNTRACKED:
                return FileStatus.UNTRACKED;
            case FileStatus.IGNORED:
                return FileStatus.IGNORED;

            default:
                throw new Error(`Unknown status '${str}'`);
        }
    }
}

export enum FileStatus {
    UNMODIFIED = ' ',
    MODIFIED = 'M',
    ADDED = 'A',
    DELETED = 'D',
    RENAMED = 'R',
    COPIED = 'C',
    UPDATED = 'U',
    UNTRACKED = '?',
    IGNORED = '!',
}

export interface IStatus {

    local: boolean;
    indexed: boolean;
    /**
     * The index, or staging area, is where commits are prepared. 
     */
    index: FileStatus,
    /**
     * The working tree, or working directory, consists of files that you are currently working on. 
     */
    working: FileStatus,
    path: string;
    /**
     * For renames/copies.
     */
    origPath?: string;
}
