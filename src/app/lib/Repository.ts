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
    trackingBranch: string;

    branches: string[];
    activeBranch: string;

    logs: ILog[];
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

    public discardChanges(path: string): Promise<[IStatus[], string[]]> {

        const promise: Promise<string[]> = RepositoryUtility.discardChanges(this.path, path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
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

    public add(path: string): Promise<[IStatus[], string[]]> {
        const promise: Promise<string[]> = RepositoryUtility.add(this.path, path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public reset(path: string): Promise<[IStatus[], string[]]> {
        const promise: Promise<string[]> = RepositoryUtility.reset(this.path, path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public commit(message: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.commit(this.path, message);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }


    public checkoutRemote(remoteBranch: string) {
        const promise: Promise<string[]> = RepositoryUtility.checkoutRemote(this.path, remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public pullRemote(remoteBranch: string) {
        const promise: Promise<string[]> = RepositoryUtility.pullRemote(this.path, remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public setUpstream(remoteBranch: string) {
        const promise: Promise<string[]> = RepositoryUtility.setUpstream(this.path, remoteBranch);

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
        return Promise.all([
            this.fetchTags(),
            this.fetchRemoteBranches(),
            this.fetchLogs(),
            this.fetchTrackingBranch(),
        ]);
    }

    public fetchLocalInfo(): Promise<[IStatus[], string[]]> {
        return Promise.all([
            this.fetchStatus().toPromise(),
            this.fetchBranches().toPromise(),
        ]);
    }


    private fetchTags(): Promise<string[]> {

        return Repository.bindAndPromise(
            RepositoryUtility.getTags(this.path),
            (value: string[]) => {
                this.tags = value;
            }
        );
    }

    private fetchRemoteBranches(): Promise<string[]> {
        return Repository.bindAndPromise(
            RepositoryUtility.getRemoteBranches(this.path),
            (remoteBranches: string[]) => {
                this.remoteBranches = remoteBranches;
            }
        )
    }

    private static bindAndPromise<T>(observable: Observable<T>, fn: (val: T) => void) {
        const promise: Promise<T> = observable.toPromise();
        promise.then(fn);
        return promise;
    }


    private fetchTrackingBranch(): Promise<string> {

        return Repository.bindAndPromise(
            RepositoryUtility.getTrackingBranch(this.path),
            (value: string) => {
                this.trackingBranch = value;
            }
        );
    }

    private fetchLogs(): Promise<ILog[]> {
        return Repository.bindAndPromise(
            RepositoryUtility.getLogs(this.path),
            (value: ILog[]) => {
                this.logs = value;
            }
        );
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