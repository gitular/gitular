import {Observable} from 'rxjs';
import {RepositoryUtility, IStatus} from './RepositoryUtility';
import {ILog} from './ILog';
import {IBranch} from './IBranch';
import {IRepository} from './IRepository';
import {ViewType} from './ViewType';
import {EventEmitter} from '@angular/core';
import {ExecInfo} from './ExecInfo';

export class Repository
    implements IRepository {

    preferences: {
        view: ViewType;
    };
    tags: string[];
    remoteBranches: string[];
    trackingBranch: string;

    branches: IBranch[];
    activeBranch: IBranch;

    logs: ILog[];
    status: {
        working: IStatus[];
        index: IStatus[]
    }

    private repositoryUtility: RepositoryUtility;
    
    public logEvents: EventEmitter<ExecInfo>;


    constructor(public path: string) {
        this.preferences = {view: ViewType.LOGS};
        this.status = {
            working: [],
            index: []
        }

        this.repositoryUtility = new RepositoryUtility(this.path);
        this.logEvents = this.repositoryUtility.log;
    }

    public checkout(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.checkout(branch);

        promise.then(() => {
            return this.fetchLocalInfo();
        });

        return promise;
    }

    public merge(branch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.merge(branch);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public deleteBranch(branch: string): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.deleteBranch(branch);

        return promise.then(() => {
            return this.fetchLocalAndRemoteInfo();
        });
    }
    
    private promiseAll(promises: Promise<any>[]): Promise<boolean>  {
         const promise: Promise<boolean> = new Promise((resolve, reject) => {
            Promise.all(promises).then((arrays: string[][]) => {
                resolve(true);
            }).catch((e)=>{
                reject(e);
            });
        });
        
        return promise;
    }
    
    public deleteTag(tag: string): Promise<boolean> {
        
        const promise: Promise<boolean> = this.promiseAll([
            this.repositoryUtility.deleteLocalTag(tag),
            this.repositoryUtility.deleteRemoteTag(tag, 'origin'),
        ]);

        promise.then(() => {
            this.fetchLocalAndRemoteInfo();
        });

        return promise;
    }


    public discardChanges(path: string): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.discardChanges(path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public pushOrigin(): Promise<string[]> {

        const promise: Promise<string[]> = this.repositoryUtility.pushOrigin();

        promise.then(() => {
            this.fetchLocalAndRemoteInfo();
        });

        return promise;
    }

    public pull(): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.pull();

        return promise.then(() => {
            return this.fetchRemoteInfo();
        });
    }

    public fetch(): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.fetch();

        return promise.then(() => {
            return this.fetchLocalAndRemoteInfo();
        });
    }
    
    public fetchLocalAndRemoteInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchLocalInfo(),
            this.fetchRemoteInfo()
        ]);
    }


    public tag(tag: string, message: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.tag(tag, message);

        promise.then(() => {
            this.fetchLocalInfo();
        });

        return promise;
    }

    public branch(branch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.branch(branch);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public add(path: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.add(path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public reset(path: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.reset(path);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }

    public commit(message: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.commit(message);

        return promise.then(() => {
            return this.fetchLocalAndRemoteInfo();
        });
    }


    public checkoutRemote(remoteBranch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.checkoutRemote(remoteBranch);

        return promise.then(() => {
            return this.fetchLocalInfo();
        });
    }
    
    public deleteRemoteBranch(remoteBranch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.deleteRemoteBranch(remoteBranch);

        return promise.then(() => {
            return this.fetchRemoteInfo();
        });
    }

    public pullRemote(remoteBranch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.pullRemote(remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public setUpstream(remoteBranch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.setUpstream(remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public commitInfo(commit: string): Observable<string[]> {
        return this.repositoryUtility.getCommitInfo(commit);
    }

    public diff(path: string, staged: boolean): Observable<string[]> {
        return this.repositoryUtility.getDiff(path, staged);
    }

    private fetchBranches(): Observable<IBranch[]> {
        const obs: Observable<IBranch[]> = this.repositoryUtility.fetchBranches();
        obs.subscribe((branches: IBranch[]) => {

            let activeBranch: IBranch;
            for (let branch of branches) {
                if (branch.active) {
                    activeBranch = branch;
                    break;
                }
            }

            this.activeBranch = activeBranch;
            this.branches = branches;
        });
        return obs;
    }

    public fetchRemoteInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchRemoteBranches(),
            this.fetchLogs(),
            this.fetchTrackingBranch(),
        ]);
    }

    public fetchLocalInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchStatus().toPromise(),
            this.fetchBranches().toPromise(),
            this.fetchTags(),
        ]);
    }


    private fetchTags(): Promise<string[]> {

        return Repository.bindAndPromise(
            this.repositoryUtility.getTags(),
            (value: string[]) => {
                this.tags = value;
            }
        );
    }

    private fetchRemoteBranches(): Promise<string[]> {
        return Repository.bindAndPromise(
            this.repositoryUtility.getRemoteBranches(),
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
            this.repositoryUtility.getTrackingBranch(),
            (value: string) => {
                this.trackingBranch = value;
            }
        );
    }

    private fetchLogs(): Promise<ILog[]> {
        return Repository.bindAndPromise(
            this.repositoryUtility.getLogs(),
            (value: ILog[]) => {
                this.logs = value;
            }
        );
    }

    private fetchStatus(): Observable<IStatus[]> {
        this.repositoryUtility
            .getStatus()
            .subscribe((statuses: IStatus[]) => {
                this.status.index = statuses.filter((status: IStatus) => {
                    return status.indexed;
                });
                this.status.working = statuses.filter((status: IStatus) => {
                    return status.local;
                });
            });

        return this.repositoryUtility.getStatus();
    }

}