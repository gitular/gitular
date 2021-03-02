import { IBranch } from "../IBranch";
import { ILog } from "../ILog";
import { ChangeStatus, IRepository } from "../IRepository";
import { IStatus } from "../IStatus";
import { RepositoryUtility } from "./RepositoryUtility";
import { ViewType } from "../ViewType";
import { ExecUtil } from "app/lib/Exec/ExecUtil";
import { Subscription } from "rxjs";
import { FileStatus } from "../FileStatus";


export class Repository implements IRepository {

    public activeBranch?: IBranch;

    public branches?: IBranch[];

    public logs?: ILog[];

    public preferences: {
        view: ViewType;
    };
    public remoteBranches?: string[];
    public status: {
        index: ChangeStatus[];
        working: ChangeStatus[];
    };
    public tags?: string[];
    public trackingBranch?: string;


    public constructor(
        public readonly path: string,
        public readonly execUtil: ExecUtil,
        public readonly repositoryUtility: RepositoryUtility,

    ) {
        this.preferences = { view: ViewType.LOADING };
        this.status = {
            working: [],
            index: [],
        };
    }

    public subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription {
        return this.execUtil.subscribe(generatorOrNext, error, complete);
    }

    public async add(path: string): Promise<void> {
        await this.repositoryUtility.add(path);
        void this.fetchLocalInfo();
    }

    public async branch(branch: string): Promise<void> {
        await this.repositoryUtility.branch(branch);
        void this.fetchLocalInfo();
    }

    public async checkout(branch: string): Promise<string[]> {
        const checkoutResult: string[] = await this.repositoryUtility.checkout(branch);
        // Fetch in background
        void this.fetchLocalInfo();
        return checkoutResult;
    }

    public async checkoutRemote(remoteBranch: string): Promise<void> {
        await this.repositoryUtility.checkoutRemote(remoteBranch);
        // Fetch in background
        void this.fetchLocalInfo();
    }

    public async commit(message: string): Promise<void> {
        await this.repositoryUtility.commit(message);
        void this.fetchLocalAndRemoteInfo();
    }

    public async commitInfo(commit: string): Promise<string[]> {
        return this.repositoryUtility.getCommitInfo(commit);
    }

    public async deleteBranch(branch: string): Promise<void> {
        await this.repositoryUtility.deleteBranch(branch);
        void this.fetchLocalAndRemoteInfo();
    }

    public async deleteRemoteBranch(remoteBranch: string): Promise<void> {
        await this.repositoryUtility.deleteRemoteBranch(remoteBranch);

        void this.fetchRemoteInfo();
    }

    public async deleteTag(tag: string): Promise<void> {
        await Promise.all([
            this.repositoryUtility.deleteLocalTag(tag),
            this.repositoryUtility.deleteRemoteTag(tag, "origin"),
        ]);
        void this.fetchLocalAndRemoteInfo();
    }

    public diff(path: string, staged: boolean): Promise<string[]> {
        return this.repositoryUtility.getDiff(path, staged);
    }

    public async discardChanges(path: string): Promise<void> {
        await this.repositoryUtility.discardChanges(path);
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
        await this.repositoryUtility.pull(branch);
        void this.fetchRemoteInfo();
    }

    public pullRemote(remoteBranch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.pullRemote(remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public pushOrigin(): Promise<string[]> {

        const promise: Promise<string[]> = this.repositoryUtility.pushOrigin();

        promise.then(() => {
            this.fetchLocalAndRemoteInfo();
        });

        return promise;
    }

    public async reset(path: string): Promise<void> {
        await this.repositoryUtility.reset(path);
        void this.fetchLocalInfo();
    }

    public async setUpstream(remoteBranch: string): Promise<string[]> {
        const result: string[] = await this.repositoryUtility.setUpstream(remoteBranch);

        void this.fetchLocalInfo();
        void this.fetchRemoteInfo();

        return result;
    }

    public async tag(tag: string, message: string): Promise<string[]> {
        const result: string[] = await this.repositoryUtility.tag(tag, message);
        void this.fetchLocalInfo();
        return result;
    }

    private async fetchBranches(): Promise<IBranch[]> {
        const branches: IBranch[] = await this.repositoryUtility.fetchBranches();

        const activeBranch: IBranch | undefined = branches.find((branch: IBranch): boolean => {
            return branch.active;
        });
        if (activeBranch === undefined) {
            throw new Error("Failed to find active branch");
        }
        this.activeBranch = activeBranch;
        this.branches = branches;

        return branches;
    }

    private async fetchLogs(): Promise<ILog[]> {
        const logs: ILog[] = await this.repositoryUtility.getLogs();
        this.logs = logs;
        return logs;
    }

    public async show(...options: string[]): Promise<string[]> {
        return await this.repositoryUtility.show(...options);
    }

    private async fetchRemoteBranches(): Promise<string[]> {
        const remoteBranches: string[] = await this.repositoryUtility.getRemoteBranches();
        this.remoteBranches = remoteBranches;
        return remoteBranches;
    }

    private async fetchStatus(): Promise<void> {
        const statuses = await this.repositoryUtility.getStatus();

        this.status.index = statuses.filter((status: IStatus): boolean => {
            return status.indexed;
        }).map((status: IStatus): ChangeStatus => {
            const indexed: boolean = true;
            const path: string = status.path;
            const origPath: string | undefined = status.origPath;
            const fileStatus: FileStatus = status.index;

            return {
                indexed,
                path,
                origPath,
                status: fileStatus
            }

        });
        this.status.working  = statuses.filter((status: IStatus): boolean => {
            return status.local;
        }).map((status: IStatus): ChangeStatus => {
            const indexed: boolean = false;
            const path: string = status.path;
            const origPath: string | undefined = status.origPath;
            const fileStatus: FileStatus = status.working;

            return {
                indexed,
                path,
                origPath,
                status: fileStatus
            }

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
        const tags: string[] = await this.repositoryUtility.getTags();
        this.tags = tags;
        return tags;
    }

    private async fetchTrackingBranch(): Promise<string> {
        const trackingBranch: string = await this.repositoryUtility.getTrackingBranch();
        this.trackingBranch = trackingBranch;
        return trackingBranch;
    }
}
