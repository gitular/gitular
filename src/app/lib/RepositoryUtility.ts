import * as child_process from 'child_process';
import {Observable, Subscriber} from 'rxjs';
import {map} from 'rxjs/operators';
import {ILog} from './ILog';
import {IBranch} from './IBranch';
import {EventEmitter} from '@angular/core';
import {ExecInfo} from './ExecInfo';


export class RepositoryUtility {

    public log: EventEmitter<ExecInfo> = new EventEmitter<ExecInfo>();


    public constructor(private path: string) {

    }


    private getLinesAsync(cmd: string): Observable<string[]> {
        console.log(cmd);
        const observable: Observable<string[]> = Observable.create((subscriber: Subscriber<string[]>) => {
            child_process
                .exec(cmd, {
                    cwd: this.path
                }, (error, stdout, stderr) => {
                    this.log.emit({
                        command: cmd,
                        success: !error,
                        stdout,
                        stderr,
                        error,
                    });

                    if (error) {
                        subscriber.error(error);
                        return;
                    }

                    const lines: Array<string> = stdout
                        .toString()
                        .split('\n');

                    const filterLines: string[] = lines.filter((v) => (v !== ''));
                    subscriber.next(filterLines);
                    subscriber.complete();
                });
        });

        return observable;

    }


    public checkout(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout ${branch}`).toPromise();
    }

    public merge(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git merge ${branch}`).toPromise();
    }

    public checkoutRemote(remoteBranch: string): Promise<string[]> {

        const branch: string = remoteBranch.substr(remoteBranch.indexOf('/') + 1);

        return this.getLinesAsync(`git checkout -b ${branch} ${remoteBranch}`).toPromise();
    }

    public deleteRemoteBranch(remoteBranch: string): Promise<string[]> {
        const parts: string[] = remoteBranch.split('/', 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesAsync(`git push --delete  ${remote} ${branch}`).toPromise();
    }

    public pullRemote(remoteBranch: string): Promise<string[]> {

        const parts: string[] = remoteBranch.split('/', 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesAsync(`git pull ${remote} ${branch}`).toPromise();
    }

    public setUpstream(remoteBranch: string): Promise<string[]> {

        return this.getLinesAsync(`git branch --set-upstream-to=${remoteBranch}`).toPromise();
    }

    public deleteBranch(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git branch -d ${branch}`).toPromise();
    }
    
    public deleteLocalTag(tag: string): Promise<string[]> {
        
        return this.getLinesAsync(`git tag --delete ${tag}`).toPromise();
    }    
    
    public deleteRemoteTag(tag: string, remote: string): Promise<string[]> {
        
        return this.getLinesAsync(`git push --delete ${remote} ${tag}`).toPromise();
    }

    public discardChanges(filePath: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout ${filePath}`).toPromise();
    }

    public branch(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout -b ${branch}`).toPromise();
    }
    
    public tag(tag: string, message: string): Promise<string[]> {
        
        // Escape quotes from message
        message = message.replace(/'/g,"\\'");
        return this.getLinesAsync(`git tag -a ${tag} -m '${message}'`).toPromise();
    }

    public add(path: string): Promise<string[]> {

        return this.getLinesAsync(`git add ${path}`).toPromise();
    }

    public reset(path: string): Promise<string[]> {

        return this.getLinesAsync(`git reset HEAD ${path}`).toPromise();
    }

    public commit(message: string): Promise<string[]> {

        // Escape quotes from message
        message = message.replace(/'/g,"\\'");
        return this.getLinesAsync(`git commit -m '${message}'`).toPromise();
    }

    public fetchBranches(): Observable<IBranch[]> {
        
        return this.getLinesAsync("git branch -vv")
            .pipe(map((lines: string[]): IBranch[] => {
                
                const infos: IBranch[] = [];
                for (const line of lines) {
                    const regex: RegExp = /(\*|) (\w+)\s+(\w{7}) (\[(\w+\/\w+)(: (.+) (\d+))?\] )?(.+)/gm;
                    const result: RegExpMatchArray | null = regex.exec(line);

                    if (result === null) {
                        throw new Error(`Failed to match '${line}'`);
                    } 

                    const active: boolean = result[1] === '*';
                    const name: string = result[2];
                    const shortRevision: string = result[3];
                    const message: string = result[9];
                    const trackingBranch: string = result[5];
                    
                    const branchInfo: IBranch = {
                        active,
                        name,
                        shortRevision,
                        message,
                    }
                    
                    if (trackingBranch) {
                        branchInfo.trackingBranch = trackingBranch;
                        const aheadBehind: string = result[7];
                        const aheadBehindCount: number = (result[8]) ? parseInt(result[8]) : 0;

                        if (aheadBehind == 'ahead') {
                            branchInfo.ahead = aheadBehindCount;
                            branchInfo.behind = 0;
                        } else if (aheadBehind == 'behind') {
                            branchInfo.ahead = 0;
                            branchInfo.behind = aheadBehindCount;                            
                        } else {
                            branchInfo.ahead = 0;
                            branchInfo.behind = 0;  
                        }
                    }
                    infos.push(branchInfo);
                }
                
                return infos;
            }));
    }

    public pushOrigin(): Promise<string[]> {
        return this.getLinesAsync(`git push -u origin HEAD`).toPromise();
    }

    public pull(): Promise<string[]> {
        return this.getLinesAsync(`git pull`).toPromise();
    }

    public fetch(): Promise<string[]> {
        return this.getLinesAsync(`git fetch`).toPromise();
    }

    public getTags(): Observable<string[]> {
        return this.getLinesAsync("git tag");
    }

    public getRemoteBranches(): Observable<string[]> {
        return this.getLinesAsync("git branch -r").pipe(
            map((lines: string[]) => {
                return lines
                    .filter((line: string) => {
                        return line.indexOf('->') < 0;
                    })
                    .map((line: string) => {
                        return line.trim();
                    });
            })
        );
    }

    public getTrackingBranch(): Observable<string> {
        return this.getLinesAsync("git rev-parse --abbrev-ref --symbolic-full-name @{u}")
            .pipe(
                map((lines: string[]) => {
                    return lines[0];
                })
            );
    }

    public getCommitInfo(commit: string): Observable<string[]> {
        return this.getLinesAsync(`git show '${commit}'`);
    }

    public getDiff(filePath: string, staged: boolean): Observable<string[]> {
        if (staged) {
            return this.getLinesAsync(`git diff --staged '${filePath}'`);
        } else {
            return this.getLinesAsync(`git diff '${filePath}'`);
        }
    }

    public getLogs(): Observable<ILog[]> {
        return this.getLinesAsync(`git log --all --graph --format=">> %H %s <%ae> '%an' '%cr' '%d'"`)
            .pipe(map((lines: string[]) => {

                const logs: ILog[] = [];
                for (const line of lines) {
                    if (line.indexOf('>>') == -1) {
                        logs.push({
                            graph: Array.from(line),
                            commit: '',
                            message: '',
                            authorEmail: '',
                            authorName: '',
                            relativeDate: '',
                            branches: [],
                            tags: []
                        });
                        continue;
                    }
                    const regex: RegExp = /(.*)>> ([0-9a-fA-F]{40}) (.*) <(.*)> '(.*)' '(.*)' '(.*)'/gm;
                    const result: RegExpMatchArray | null = regex.exec(line);
                    if (result === null) {
                        throw new Error(`Failed to match '${line}'`);
                    }
                    const graph: string[] = Array.from(result[1]);
                    const commit: string = result[2];
                    const message: string = result[3];
                    const authorEmail: string = result[4];
                    const authorName: string = result[5];
                    const relativeDate: string = result[6];

                    let reflog: string = result[7].trim();
                    if (reflog.startsWith('(') && reflog.endsWith(')')) {
                        reflog = reflog.substring(1, reflog.length - 1);
                    }
                    const reflogs: string[] = reflog
                        .split(',')
                        .map((value: string) => {

                            if (value.indexOf('->') >= 0) {
                                value = value.substring(value.indexOf('->') + 2)
                            }

                            return value.trim();
                        })
                        .filter((value: string) => {
                            return value !== '';
                        });

                    const branches: string[] = [];
                    const tags: string[] = [];

                    for (let reflog of reflogs) {
                        if (reflog.startsWith('tag:')) {
                            tags.push(reflog.substring(4));
                        } else {
                            branches.push(reflog);
                        }
                    }

                    logs.push({
                        graph,
                        commit,
                        message,
                        authorEmail,
                        authorName,
                        relativeDate,
                        tags,
                        branches
                    });
                }
                return logs;

            }));
    }

    public getStatus(): Observable<IStatus[]> {

        const copyRenameRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*) -> (.*)/;
        const statusLineRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*)/;;

        return this.getLinesAsync("git status -s -u").pipe(
            map((lines: string[]) => {

                const statuses: IStatus[] = [];

                for (const line of lines) {
                    const copyRenameResult: RegExpMatchArray = copyRenameRegex.exec(line);

                    if (copyRenameResult != undefined) {

                        statuses.push(this.createStatus(
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

    private createStatus(
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


    private fileStatusFromString(str: string): FileStatus {
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
