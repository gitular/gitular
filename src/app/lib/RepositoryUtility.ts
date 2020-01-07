import { EventEmitter } from "@angular/core";
import * as child_process from "child_process";
import { Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";

import { ExecInfo } from "./ExecInfo";
import { FileStatus } from "./FileStatus";
import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { IStatus } from "./IStatus";

export class RepositoryUtility {

    public log: EventEmitter<ExecInfo> = new EventEmitter<ExecInfo>();

    public constructor(private readonly path: string) {

    }

    public async add(path: string): Promise<string[]> {

        return this.getLinesAsync(`git add ${path}`).toPromise();
    }

    public async branch(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout -b ${branch}`).toPromise();
    }

    public async checkout(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout ${branch}`).toPromise();
    }

    public async checkoutRemote(remoteBranch: string): Promise<string[]> {

        const branch: string = remoteBranch.substr(remoteBranch.indexOf("/") + 1);

        return this.getLinesAsync(`git checkout -b ${branch} ${remoteBranch}`).toPromise();
    }

    public async commit(message: string): Promise<string[]> {

        // Escape quotes from message
        message = message.replace(/"/g, "\\\"");
        // Escape $ to prevent environment variables being injected
        message = message.replace(/\$/g, "\\\$");
        
        const cmd: string = `git commit -m "${message}"`;
        return this.getLinesAsync(cmd).toPromise();
    }

    public async deleteBranch(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git branch -d ${branch}`).toPromise();
    }

    public async deleteLocalTag(tag: string): Promise<string[]> {

        return this.getLinesAsync(`git tag --delete ${tag}`).toPromise();
    }

    public async deleteRemoteBranch(remoteBranch: string): Promise<string[]> {
        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesAsync(`git push --delete  ${remote} ${branch}`).toPromise();
    }

    public async deleteRemoteTag(tag: string, remote: string): Promise<string[]> {

        return this.getLinesAsync(`git push --delete ${remote} ${tag}`).toPromise();
    }

    public async  discardChanges(filePath: string): Promise<string[]> {

        return this.getLinesAsync(`git checkout ${filePath}`).toPromise();
    }

    public fetch(): Promise<string[]> {
        return this.getLinesAsync("git fetch").toPromise();
    }

    public fetchBranches(): Observable<IBranch[]> {

        return this.getLinesAsync("git branch -vv")
            .pipe(map((lines: string[]): IBranch[] => {

                const infos: IBranch[] = [];
                for (const line of lines) {
                    const regex: RegExp = /(\*?) ([\S-]+)\s+(\w{7}) (\[(\w+\/\w+)(: (.+) (\d+))?\] )?(.+)/gm;
                    const result: RegExpMatchArray | null = regex.exec(line);

                    if (result === null) {
                        throw new Error(`Failed to match branch '${line}'`);
                    }

                    const active: boolean = result[1] === "*";
                    const name: string = result[2];
                    const shortRevision: string = result[3];
                    const message: string = result[9];
                    const trackingBranch: string = result[5];

                    const branchInfo: IBranch = {
                        active,
                        name,
                        shortRevision,
                        message,
                    };

                    if (trackingBranch) {
                        branchInfo.trackingBranch = trackingBranch;
                        const aheadBehind: string = result[7];
                        const aheadBehindCount: number = (result[8]) ? parseInt(result[8]) : 0;

                        if (aheadBehind == "ahead") {
                            branchInfo.ahead = aheadBehindCount;
                            branchInfo.behind = 0;
                        } else if (aheadBehind == "behind") {
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
                    if (line.indexOf(">>") == -1) {
                        logs.push({
                            graph: Array.from(line),
                            commit: "",
                            message: "",
                            authorEmail: "",
                            authorName: "",
                            relativeDate: "",
                            branches: [],
                            tags: [],
                        });
                        continue;
                    }
                    const regex: RegExp = /(.*)>> ([0-9a-fA-F]{40}) (.*) <(.*)> '(.*)' '(.*)' '(.*)'/gm;
                    const result: RegExpMatchArray | null = regex.exec(line);
                    if (result === null) {
                        throw new Error(`Failed to match log entry '${line}'`);
                    }
                    const graph: string[] = Array.from(result[1]);
                    const commit: string = result[2];
                    const message: string = result[3];
                    const authorEmail: string = result[4];
                    const authorName: string = result[5];
                    const relativeDate: string = result[6];

                    let reflog: string = result[7].trim();
                    if (reflog.startsWith("(") && reflog.endsWith(")")) {
                        reflog = reflog.substring(1, reflog.length - 1);
                    }
                    const reflogs: string[] = reflog
                        .split(",")
                        .map((value: string) => {

                            if (value.indexOf("->") >= 0) {
                                value = value.substring(value.indexOf("->") + 2);
                            }

                            return value.trim();
                        })
                        .filter((value: string) =>
                            value !== "");

                    const branches: string[] = [];
                    const tags: string[] = [];

                    for (const reflog of reflogs) {
                        if (reflog.startsWith("tag:")) {
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
                        branches,
                    });
                }

                return logs;

            }));
    }

    public getRemoteBranches(): Observable<string[]> {
        return this.getLinesAsync("git branch -r").pipe(
            map((lines: string[]) =>
                lines
                    .filter((line: string) => line.indexOf("->") < 0)
                    .map((line: string) => line.trim())),
        );
    }

    public getStatus(): Observable<IStatus[]> {

        const copyRenameRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*) -> (.*)/;
        const statusLineRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*)/;

        return this.getLinesAsync("git status -s -u").pipe(
            map((lines: string[]) => {

                const statuses: IStatus[] = [];

                for (const line of lines) {
                    const copyRenameResult: RegExpMatchArray | null = copyRenameRegex.exec(line);

                    if (copyRenameResult != undefined) {

                        statuses.push(this.createStatus(
                            copyRenameResult[1],
                            copyRenameResult[2],
                            copyRenameResult[4],
                            copyRenameResult[3],
                        ));
                    } else {
                        const result: RegExpMatchArray | null = statusLineRegex.exec(line);

                        if (result === null) {
                            throw new Error(`Failed to parse line '${line}'`);
                        }

                        statuses.push(this.createStatus(
                            result[1],
                            result[2],
                            result[3],
                        ));
                    }
                }

                return statuses;

            }),
        );
    }

    public getTags(): Observable<string[]> {
        return this.getLinesAsync("git tag");
    }

    public getTrackingBranch(): Observable<string> {
        return this.getLinesAsync("git rev-parse --abbrev-ref --symbolic-full-name @{u}")
            .pipe(
                map((lines: string[]) =>
                    lines[0]),
            );
    }

    public async merge(branch: string): Promise<string[]> {

        return this.getLinesAsync(`git merge ${branch}`).toPromise();
    }

    public async pull(): Promise<string[]> {
        return this.getLinesAsync("git pull").toPromise();
    }

    public async pullRemote(remoteBranch: string): Promise<string[]> {

        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesAsync(`git pull ${remote} ${branch}`).toPromise();
    }

    public async pushOrigin(): Promise<string[]> {
        return this.getLinesAsync("git push -u origin HEAD").toPromise();
    }

    public async reset(path: string): Promise<string[]> {

        return this.getLinesAsync(`git reset HEAD ${path}`).toPromise();
    }

    public async setUpstream(remoteBranch: string): Promise<string[]> {

        return this.getLinesAsync(`git branch --set-upstream-to=${remoteBranch}`).toPromise();
    }

    public async tag(tag: string, message: string): Promise<string[]> {
        if (message.trim() !== "") {
            // Escape quotes from message
            const escapedMessage: string = message.replace(/'/g, "\\'");

            return this.getLinesAsync(`git tag -a ${tag} -m '${escapedMessage}'`)
                .toPromise();
        } else {

            return this.getLinesAsync(`git tag ${tag}`)
                .toPromise();
        }

    }

    private createStatus(
        index: string,
        working: string,
        path: string,
        origPath?: string,
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
        };
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

    private getLinesAsync(cmd: string): Observable<string[]> {
        console.log(cmd);
        const observable: Observable<string[]> = Observable.create((subscriber: Subscriber<string[]>) => {
            child_process
                .exec(cmd, {
                    cwd: this.path,
                },    (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {

                    const toLog: ExecInfo = {
                        command: cmd,
                        success: !error,
                        stdout,
                        stderr,
                        error,
                    };
                    this.log.emit(toLog);

                    if (error) {
                        subscriber.error(error);

                        return;
                    }

                    const lines: string[] = stdout
                        .toString()
                        .split("\n");

                    const filterLines: string[] = lines.filter((v) => (v !== ""));
                    subscriber.next(filterLines);
                    subscriber.complete();
                });
        });

        return observable;

    }
}
