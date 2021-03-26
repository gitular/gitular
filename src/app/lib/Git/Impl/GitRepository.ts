import { IBranch } from "../IBranch";
import { ILog } from "../ILog";
import { GitRepositoryI as GitRepositoryI } from "../GitRepositoryI";
import { ChangeStatusI } from "../ChangeStatusI";
import { IStatus } from "../IStatus";
import { GitExec } from "./GitExec";
import { ApplyOptionsI } from "./ApplyOptionsI";
import { DiffOptionsI } from "./DiffOptionsI";
import { ViewType } from "../ViewType";
import { Subscription } from "rxjs";
import { fileStatusFromString, FileStatusI } from "../FileStatusI";
import { ExecUtil } from "../../Exec/ExecUtil";


export class GitRepository implements GitRepositoryI {

    public activeBranch?: IBranch;

    public branches?: IBranch[];

    public logs?: ILog[];

    public preferences: {
        view: ViewType;
    };
    public remoteBranches?: string[];
    public status: {
        index: ChangeStatusI[];
        working: ChangeStatusI[];
    };
    public tags?: string[];
    public trackingBranch?: string;


    public constructor(
        public readonly path: string,
        public readonly execUtil: ExecUtil,
        public readonly repositoryUtility: GitExec,

    ) {
        this.preferences = { view: ViewType.LOADING };
        this.status = {
            working: [],
            index: [],
        };
    }

    public async add(path: string): Promise<void> {
        await this.repositoryUtility.add(path);
        await this.fetchStatus();
    }

    public async apply(patch: string[], options: ApplyOptionsI): Promise<void> {
        await this.repositoryUtility.apply(options, patch);
        void this.fetchLocalInfo();
        void this.fetchStatus();
    }

    public async branch(branch: string): Promise<void> {
        await this.repositoryUtility.checkout({
            b: branch,
        });
        void this.fetchLocalInfo();
    }

    public async checkout(branch: string): Promise<string[]> {
        const checkoutResult: string[] = await this.repositoryUtility.checkout({}, branch);
        // Fetch in background
        void this.fetchLocalInfo();
        return checkoutResult;
    }

    public async checkoutRemote(remoteBranch: string): Promise<void> {

        const branchName: string = remoteBranch.substr(remoteBranch.indexOf("/") + 1);

        await this.repositoryUtility.checkout({
            'b': branchName,
        }, remoteBranch);

        // Fetch in background
        void this.fetchLocalInfo();
    }

    public async commit(message: string): Promise<void> {
        await this.repositoryUtility.commit({ message });
        void this.fetchLocalAndRemoteInfo();
    }

    public async commitInfo(commit: string): Promise<string[]> {
        return this.show(commit);
    }

    public async deleteBranch(branch: string): Promise<void> {
        await this.repositoryUtility.branch({ delete: true }, branch);
        void this.fetchLocalAndRemoteInfo();
    }

    public async deleteRemoteBranch(remoteBranch: string): Promise<void> {

        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        await this.repositoryUtility.push({ delete: true }, remote, branch);

        void this.fetchRemoteInfo();
    }

    public async deleteTag(tag: string): Promise<void> {
        await Promise.all([
            this.repositoryUtility.tag({ delete: true }, tag),
            this.repositoryUtility.push({ delete: true }, "origin", tag),
        ]);
        void this.fetchLocalAndRemoteInfo();
    }

    public diff(options: DiffOptionsI, args: string[]): Promise<string[]> {
        return this.repositoryUtility.diff(options, args);
    }

    public async discardChanges(path: string): Promise<void> {
        await this.repositoryUtility.checkout({}, path);
        void this.fetchLocalInfo();
    }

    public async fetch(): Promise<void> {
        await this.repositoryUtility.fetch();
        void this.fetchLocalAndRemoteInfo();
    }

    public async fetchLocalAndRemoteInfo(): Promise<void> {
        await Promise.all([
            this.fetchLocalInfo(),
            this.fetchRemoteInfo(),
        ]);
    }

    public async fetchLocalInfo(): Promise<void> {
        await Promise.all([
            this.fetchStatus(),
            this.fetchBranches(),
            this.fetchTags(),
        ]);
    }

    public async fetchRemoteInfo(): Promise<void> {
        await Promise.all([
            this.fetchRemoteBranches(),
            this.fetchLogs(),
            this.fetchTrackingBranch(),
        ]);
    }

    public async merge(branch: string): Promise<void> {
        await this.repositoryUtility.merge(branch);
        void this.fetchLocalInfo();
    }

    public async pull(branch: string | undefined = undefined): Promise<void> {
        if (branch !== undefined) {
            const parts: string[] = branch.split('/', 2);
            await this.repositoryUtility.pull(...parts);
        } else {
            await this.repositoryUtility.pull();
        }
        void this.fetchRemoteInfo();
    }

    public async pullRemote(remoteBranch: string): Promise<string[]> {

        const parts: string[] = remoteBranch.split("/", 2);

        const remote: string = parts[0];
        const branch: string = parts[1];

        const lines: string[] = await this.repositoryUtility.pull(remote, branch);

        void this.fetchLocalInfo();
        void this.fetchRemoteInfo();

        return lines;
    }

    public async pushOrigin(): Promise<string[]> {
        const lines: string[] = await this.repositoryUtility.push({ 'set-upstream': true }, 'origin', 'HEAD');

        void this.fetchLocalAndRemoteInfo();

        return lines;
    }

    public async reset(path: string): Promise<void> {
        await this.repositoryUtility.reset(path);
        void this.fetchLocalInfo();
    }

    public async setUpstream(remoteBranch: string): Promise<string[]> {
        const result: string[] = await this.repositoryUtility.branch({ 'set-upstream-to': remoteBranch });

        void this.fetchLocalInfo();
        void this.fetchRemoteInfo();

        return result;
    }

    public async tag(tag: string, message: string): Promise<string[]> {
        let result: string[];
        if (message.trim() !== "") {
            // Escape quotes from message
            result = await this.repositoryUtility.tag({ annotate: tag, message });
        } else {
            result = await this.repositoryUtility.tag({}, tag);
        }
        void this.fetchLocalInfo();
        return result;
    }

    public async fetchBranches(): Promise<IBranch[]> {
        const branches: IBranch[] = await this.lookupBranches();

        const activeBranch: IBranch | undefined = branches.find((branch: IBranch): boolean => {
            return branch.active;
        });
        if (activeBranch === undefined) {
            console.log({ branches });
            throw new Error("Failed to find active branch");
        }
        this.activeBranch = activeBranch;
        this.branches = branches;

        return branches;
    }

    private async fetchLogs(): Promise<ILog[]> {
        const logs: ILog[] = await this.lookupLogs();
        this.logs = logs;
        return logs;
    }

    public async show(...options: string[]): Promise<string[]> {
        return await this.repositoryUtility.show(...options);
    }

    private async fetchRemoteBranches(): Promise<string[]> {

        const branches: string[] = await this.repositoryUtility.branch({ 'remotes': true });
        const remoteBranches: string[] = branches
            .filter((line: string) => line.indexOf("->") < 0)
            .map((line: string) => line.trim());


        this.remoteBranches = remoteBranches;
        return remoteBranches;
    }

    /**
     * Fetch statuses.
     */
    private async fetchStatus(): Promise<void> {
        const statuses = await this.getStatus();

        this.status.index = statuses.filter((status: IStatus): boolean => {
            return status.indexed;
        }).map((status: IStatus): ChangeStatusI => {
            const indexed: boolean = true;
            const path: string = status.path;
            const origPath: string | undefined = status.origPath;
            const fileStatus: FileStatusI = status.index;

            return {
                indexed,
                path,
                origPath,
                status: fileStatus
            };

        });
        this.status.working = statuses.filter((status: IStatus): boolean => {
            return status.local;
        }).map((status: IStatus): ChangeStatusI => {
            const indexed: boolean = false;
            const path: string = status.path;
            const origPath: string | undefined = status.origPath;
            const fileStatus: FileStatusI = status.working;

            return {
                indexed,
                path,
                origPath,
                status: fileStatus
            };

        });

        if (this.preferences.view === ViewType.LOADING) {
            if (this.status.index.length > 0 || this.status.working.length > 0) {
                this.preferences.view = ViewType.WORKING_COPY;
            } else {
                this.preferences.view = ViewType.LOGS;
            }
        }
    }

    private async fetchTags(): Promise<string[]> {
        const tags: string[] = await this.repositoryUtility.tag({});
        this.tags = tags;
        return tags;
    }

    private async fetchTrackingBranch(): Promise<string> {

        const lines: string[] = await this.repositoryUtility.revParse({ 'abbrev-ref': true, 'symbolic-full-name': '@{u}' });

        const trackingBranch: string = lines[0];
        this.trackingBranch = trackingBranch;
        return trackingBranch;
    }


    private async lookupBranches(): Promise<IBranch[]> {
        // Pass verbose as both an option and an arg - as we need it to be set twice
        const lines: string[] = await this.repositoryUtility.branch({
            '-vv': true,
        });
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


    private async lookupLogs(): Promise<ILog[]> {
        const lines: string[] = await this.repositoryUtility.log({
            all: true,
            graph: true,
            format: ">> %H %s <%ae> '%an' '%cr' '%d'"
        });
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


    public async getStatus(): Promise<IStatus[]> {
        const lines: string[] = await this.repositoryUtility.status({
            "untracked-files": true,
            short: true,
        });

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

    private createStatus(
        index: string,
        working: string,
        path: string,
        origPath?: string,
    ): IStatus {
        const indexStatus: FileStatusI = fileStatusFromString(index);
        const localStatus: FileStatusI = fileStatusFromString(working);

        return {
            indexed: (indexStatus !== FileStatusI.UNMODIFIED) && (indexStatus !== FileStatusI.UNTRACKED),
            local: (localStatus !== FileStatusI.UNMODIFIED),
            index: indexStatus,
            working: localStatus,
            origPath,
            path,
        };
    }
}
