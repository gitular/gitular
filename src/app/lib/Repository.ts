import {Observable} from 'rxjs';
import {RepositoryUtility, IStatus} from './RepositoryUtility';
import {ILog} from './ILog';
import {IRepository} from './IRepository';
import {ViewType} from './ViewType';

export class Repository
    implements IRepository {

    preferences: {
        view: ViewType;
    };
    tags: string[];
    remoteBranches: string[];
    branches: string[];
    logs: ILog[];
    activeBranch: string;
    status: {
        working: IStatus[];
        index: IStatus[]
    }

    constructor(public path: string) {
        this.preferences = {view: ViewType.LOGS};
        this.status = {
            working: [],
            index: []
        }
    }

    public checkout(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.checkout(this.path, branch);

        promise.then(() => {
            this.fetchRemoteInfo();
            this.fetchLocalInfo();
        });

        return promise;
    }

    public deleteBranch(branch: string): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.deleteBranch(this.path, branch);

        promise.then(() => {
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public pushOrigin(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.pushOrigin(this.path);

        promise.then(() => {
            this.fetchRemoteInfo();
            this.fetchLocalInfo();
        });

        return promise;
    }

    public pull(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.pull(this.path);

        promise.then(() => {
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public fetch(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.fetch(this.path);

        promise.then(() => {
            this.fetchRemoteInfo();
        });

        return promise;
    }


    public branch(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.branch(this.path, branch);

        promise.then(() => {
            this.fetchLocalInfo();
        });

        return promise;
    }

    public add(path: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.add(this.path, path);

        promise.then(() => {
            this.fetchLocalInfo();
        });

        return promise;
    }
    public reset(path: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.reset(this.path, path);

        promise.then(() => {
            this.fetchLocalInfo();
        });

        return promise;
    }

    public commit(message: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.commit(this.path, message);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public commitInfo(commit: string): Observable<string[]> {
        return RepositoryUtility.getCommitInfo(this.path, commit);
    }

    public diff(path: string, staged: boolean): Observable<string[]> {
        return RepositoryUtility.getDiff(this.path, path, staged);
    }

    private fetchBranches(): Observable<string[]> {

        const obs: Observable<string[]> = RepositoryUtility.fetchBranches(this.path);
        obs.subscribe((branches: string[]) => {
            
            let activeBranch = '';
            for (let i = 0; i < branches.length; i++) {
                if (branches[i].startsWith('* ')) {
                    activeBranch = branches[i].substring(2);
                    branches[i] = activeBranch;
                }
            }
            
            this.activeBranch = activeBranch;
            this.branches = branches;
        });
        return obs;
    }

    public fetchRemoteInfo() {
        this.fetchTags();
        this.fetchRemoteBranches();
        this.fetchLogs();
    }

    public fetchLocalInfo() {
        this.fetchStatus();
        this.fetchBranches();
    }

    private fetchTags(): void {

        RepositoryUtility.getTags(this.path).subscribe((tags: string[]) => {
            this.tags = tags;
        });
    }

    private fetchRemoteBranches(): void {
        RepositoryUtility.getRemoteBranches(this.path).subscribe((remoteBranches: string[]) => {
            this.remoteBranches = remoteBranches;
        });
    }

    private fetchLogs(): void {
        RepositoryUtility.getLogs(this.path).subscribe((logs: ILog[]) => {
            this.logs = logs;
        });
    }

    private fetchStatus(): Observable<IStatus[]> {
        RepositoryUtility
            .getStatus(this.path)
            .subscribe((statuses: IStatus[]) => {
                this.status.index = statuses.filter((status: IStatus) => {
                    return status.indexed;
                });
                this.status.working = statuses.filter((status: IStatus) => {
                    return status.local;
                });
            });

        return RepositoryUtility.getStatus(this.path);
    }

}