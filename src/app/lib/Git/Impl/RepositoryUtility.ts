import { FileStatus } from "../FileStatus";
import { IBranch } from "../IBranch";
import { ILog } from "../ILog";
import { IStatus } from "../IStatus";
import { RepositoryUtilityI } from "../RepositoryUtilityI";
import { ExecUtil } from "../../Exec/ExecUtil";
import { resolve } from "dns";

export interface ApplyOptions extends Record<string, string | boolean | undefined> {
    stat?: boolean;
    numstat?: boolean;
    summary?: boolean;
    check?: boolean;
    index?: boolean;
    cached?: boolean;
    'intent-to-add'?: boolean;
    '3way'?: boolean;
    'build-fake-ancestor'?: string;
    reverse?: boolean;
    reject?: boolean;
    'unidiff-zero'?: boolean;
    apply?: boolean;
    'no-add'?: boolean;
    'allow-binary-replacement'?: boolean;
    binary?: boolean;
    exclude?: string;
    include?: string;
    'ignore-space-change'?: boolean;
    'ignore-whitespace'?: boolean;
    'whitespace'?: string;
    'inaccurate-eof'?: string;
    verbose?: boolean;
    recount?: boolean;
    directory?: string;
    'unsafe-paths'?: boolean;
}

export class RepositoryUtility implements RepositoryUtilityI {

    public constructor(
        private readonly path: string,
        private readonly execUtil: ExecUtil,
    ) { }

    public async add(path: string): Promise<string[]> {
        return this.getLinesPromise(`git add ${path}`);
    }

    public async branch(branch: string): Promise<string[]> {

        return this.getLinesPromise(`git checkout -b ${branch}`);
    }

    public async checkout(branch: string): Promise<string[]> {

        return this.getLinesPromise(`git checkout ${branch}`);
    }

    public async checkoutRemote(remoteBranch: string): Promise<string[]> {

        const branch: string = remoteBranch.substr(remoteBranch.indexOf("/") + 1);

        return this.getLinesPromise(`git checkout -b ${branch} ${remoteBranch}`);
    }

    public async commit(message: string): Promise<string[]> {

        // Escape quotes from message
        message = message.replace(/"/g, "\\\"");
        // Escape $ to prevent environment variables being injected
        message = message.replace(/\$/g, "\\\$");

        const cmd: string = `git commit -m "${message}"`;

        return this.getLinesPromise(cmd);
    }

    public async deleteBranch(branch: string): Promise<string[]> {

        return this.getLinesPromise(`git branch -d ${branch}`);
    }

    public async deleteLocalTag(tag: string): Promise<string[]> {

        return this.getLinesPromise(`git tag --delete ${tag}`);
    }

    public async deleteRemoteBranch(remoteBranch: string): Promise<string[]> {
        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesPromise(`git push --delete  ${remote} ${branch}`);
    }

    public async deleteRemoteTag(tag: string, remote: string): Promise<string[]> {

        return this.getLinesPromise(`git push --delete ${remote} ${tag}`);
    }

    public async discardChanges(filePath: string): Promise<string[]> {

        return this.getLinesPromise(`git checkout ${filePath}`);
    }

    public fetch(): Promise<string[]> {
        return this.getLinesPromise("git fetch");
    }

    public async fetchBranches(): Promise<IBranch[]> {
        const lines: string[] = await this.getLinesPromise("git branch -vv");
        return lines.map((line: string): IBranch => {
            return this.parseBranchInfo(line);
        });
    }

    /**
     * Parse branch info from Git CLI "git branch -vv" command.
     *
     * @param line 
     */
    private parseBranchInfo(line: string) {
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
        return branchInfo;
    }

    public async getCommitInfo(commit: string): Promise<string[]> {
        return this.show(commit);
    }

    public async getDiff(filePath: string, staged: boolean): Promise<string[]> {
        if (staged) {
            return this.getLinesPromise(`git diff --staged '${filePath}'`);
        } else {
            return this.getLinesPromise(`git diff '${filePath}'`);
        }
    }

    public async show(...options: string[]): Promise<string[]> {
        const reduced: string = options.reduce((prev: string, curr: string) => {
            return prev + ` '` + curr + `'`;
        });
        console.log(reduced);
        return this.getLinesPromise(`git show ${reduced}`);
    }


    public async getLogs(): Promise<ILog[]> {
        const lines: string[] = await this.getLinesPromise(`git log --all --graph --format=">> %H %s <%ae> '%an' '%cr' '%d'"`);
        return this.parseLogs(lines);
    }

    private parseLogs(lines: string[]) {
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
            const logEntry: ILog = this.parseLogEntry(line);
            logs.push(logEntry);
        }
        return logs;
    }

    private parseLogEntry(line: string) {
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
            .filter((value: string) => value !== "");

        const branches: string[] = [];
        const tags: string[] = [];

        for (const reflog of reflogs) {
            if (reflog.startsWith("tag:")) {
                tags.push(reflog.substring(4));
            } else {
                branches.push(reflog);
            }
        }

        const logEntry: ILog = {
            graph,
            commit,
            message,
            authorEmail,
            authorName,
            relativeDate,
            tags,
            branches,
        };
        return logEntry;
    }

    public async getRemoteBranches(): Promise<string[]> {
        const branches: string[] = await this.getLinesPromise("git branch -r");
        return branches
            .filter((line: string) => line.indexOf("->") < 0)
            .map((line: string) => line.trim());
    }

    public async getStatus(): Promise<IStatus[]> {
        const lines: string[] = await this.getLinesPromise("git status -s -u");
        return lines.map((line: string) => {
            return this.parseStatus(line);
        });
    }

    private parseStatus(line: string): IStatus {
        const copyRenameRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*) -> (.*)/;
        const statusLineRegex: RegExp = /([ MADRCU?!])([ MADRCU?!]) (.*)/;


        const copyRenameResult: RegExpMatchArray | null = copyRenameRegex.exec(line);

        if (copyRenameResult != undefined) {

            return this.createStatus(
                copyRenameResult[1],
                copyRenameResult[2],
                copyRenameResult[4],
                copyRenameResult[3]
            );
        }

        const result: RegExpMatchArray | null = statusLineRegex.exec(line);

        if (result === null) {
            throw new Error(`Failed to parse line '${line}'`);
        }

        return this.createStatus(
            result[1], // 
            result[2],
            result[3]
        );

    }

    public getTags(): Promise<string[]> {
        return this.getLinesPromise("git tag");
    }

    public async getTrackingBranch(): Promise<string> {
        const lines: string[] = await this.getLinesPromise("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
        return lines[0];
    }

    public async merge(branch: string): Promise<string[]> {

        return this.getLinesPromise(`git merge ${branch}`);
    }

    public async pull(branch: string | undefined = undefined): Promise<string[]> {
        if (branch === undefined) {
            return this.getLinesPromise("git pull");
        } else {
            const parts: string[] = branch.split('/', 2);
            return this.getLinesPromise(`git pull ${parts[0]} ${parts[1]}`);
        }
    }

    public async pullRemote(remoteBranch: string): Promise<string[]> {

        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        return this.getLinesPromise(`git pull ${remote} ${branch}`);
    }

    public async pushOrigin(): Promise<string[]> {
        return this.getLinesPromise("git push -u origin HEAD");
    }

    public async reset(path: string): Promise<string[]> {

        return this.getLinesPromise(`git reset HEAD ${path}`);
    }

    public async setUpstream(remoteBranch: string): Promise<string[]> {

        return this.getLinesPromise(`git branch --set-upstream-to=${remoteBranch}`);
    }

    public async apply(patch: string[], patchOptions: ApplyOptions): Promise<string[]> {
        const optionsString: string[] = this.optionsToArgs(patchOptions);
        const result: string[] = await this.spawn('git', ['apply', ...optionsString], patch);
        console.log(result);
        return result;
    }

    private optionsToArgs(options: Record<string, boolean | string | undefined>): string[] {
        let args: string[] = [];
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value: boolean | string | undefined = options[key];

                if (value === false || value === undefined) {
                    continue;
                }

                if (value === true) {
                    args.push(`--${key}`);
                    continue;
                }

                const arg: string = this.escapeArg(value);
                args.push(`--${key}=${arg}`);
            }
        }
        return args;
    }

    public async tag(tag: string, message: string): Promise<string[]> {
        if (message.trim() !== "") {
            // Escape quotes from message
            const messageArg: string = this.escapeArg(message);
            return this.getLinesPromise(`git tag -a ${tag} -m ${messageArg}`);
        } else {

            return this.getLinesPromise(`git tag ${tag}`);
        }
    }

    private escapeArg(arg: string): string {
        const escapedMessage: string = arg.replace(/'/g, "\\'");
        return `'${escapedMessage}'`;
    }

    private createStatus(
        index: string,
        working: string,
        path: string,
        origPath?: string,
    ): IStatus {
        const indexStatus: FileStatus = this.fileStatusFromString(index);
        const localStatus: FileStatus = this.fileStatusFromString(working);

        return {
            indexed: (indexStatus !== FileStatus.UNMODIFIED) && (indexStatus !== FileStatus.UNTRACKED),
            local: (localStatus !== FileStatus.UNMODIFIED),
            index: indexStatus,
            working: localStatus,
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

    private async spawn(cmd: string, args: string[], pipe?: string[]): Promise<string[]> {
        const lines: string[] = await this.execUtil.spawn(this.path, cmd, args, pipe);

        return lines.filter((value) => {
            return value !== "";
        });
    }

    private async getLinesPromise(cmd: string, pipe?: string): Promise<string[]> {
        const lines: string[] = await this.execUtil.exec(this.path, cmd, pipe);

        return lines.filter((value) => {
            return value !== "";
        });
    }
}
