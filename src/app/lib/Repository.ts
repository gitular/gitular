import { EventEmitter } from "@angular/core";
import { Observable } from "rxjs";

import { ExecInfo } from "./ExecInfo";
import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { IRepository } from "./IRepository";
import { IStatus } from "./IStatus";
import {  RepositoryUtility } from "./RepositoryUtility";
import { ViewType } from "./ViewType";

export class Repository
    implements IRepository {

    private static bindAndPromise<T>(observable: Observable<T>, fn: (val: T) => void) {
        const promise: Promise<T> = observable.toPromise();
        promise.then(fn);

        return promise;
    }
    public activeBranch?: IBranch;

    public branches?: IBranch[];

    public logEvents: EventEmitter<ExecInfo>;

    public logs?: ILog[];

    public preferences: {
        view: ViewType;
    };
    public remoteBranches?: string[];
    public status: {
        index: IStatus[];
        working: IStatus[];
    };
    public tags?: string[];
    public trackingBranch?: string;

    private readonly repositoryUtility: RepositoryUtility;

    public constructor(public path: string) {
        this.preferences = {view: ViewType.LOADING};
        this.status = {
            working: [],
            index: [],
        };

        this.repositoryUtility = new RepositoryUtility(this.path);
        this.logEvents = this.repositoryUtility.log;
    }

    public add(path: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.add(path);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public branch(branch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.branch(branch);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public checkout(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.checkout(branch);

        promise.then(() =>
            this.fetchLocalInfo());

        return promise;
    }

    public checkoutRemote(remoteBranch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.checkoutRemote(remoteBranch);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public commit(message: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.commit(message);

        return promise.then(() =>
            this.fetchLocalAndRemoteInfo());
    }

    public commitInfo(commit: string): Observable<string[]> {
        return this.repositoryUtility.getCommitInfo(commit);
    }

    public deleteBranch(branch: string): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.deleteBranch(branch);

        return promise.then(() =>
            this.fetchLocalAndRemoteInfo());
    }

    public deleteRemoteBranch(remoteBranch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.deleteRemoteBranch(remoteBranch);

        return promise.then(() =>
            this.fetchRemoteInfo());
    }

    public deleteTag(tag: string): Promise<boolean> {

        const promise: Promise<boolean> = this.promiseAll([
            this.repositoryUtility.deleteLocalTag(tag),
            this.repositoryUtility.deleteRemoteTag(tag, "origin"),
        ]);

        promise.then(() => {
            this.fetchLocalAndRemoteInfo();
        });

        return promise;
    }

    public diff(path: string, staged: boolean): Observable<string[]> {
        return this.repositoryUtility.getDiff(path, staged);
    }

    public discardChanges(path: string): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.discardChanges(path);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public fetch(): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.fetch();

        return promise.then(() =>
            this.fetchLocalAndRemoteInfo());
    }

    public fetchLocalAndRemoteInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchLocalInfo(),
            this.fetchRemoteInfo(),
        ]);
    }

    public fetchLocalInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchStatus().toPromise(),
            this.fetchBranches().toPromise(),
            this.fetchTags(),
        ]);
    }

    public fetchRemoteInfo(): Promise<boolean> {
        return this.promiseAll([
            this.fetchRemoteBranches(),
            this.fetchLogs(),
            this.fetchTrackingBranch(),
        ]);
    }

    public merge(branch: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.merge(branch);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public pull(): Promise<boolean> {

        const promise: Promise<string[]> = this.repositoryUtility.pull();

        return promise.then(() =>
            this.fetchRemoteInfo());
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

    public reset(path: string): Promise<boolean> {
        const promise: Promise<string[]> = this.repositoryUtility.reset(path);

        return promise.then(() =>
            this.fetchLocalInfo());
    }

    public setUpstream(remoteBranch: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.setUpstream(remoteBranch);

        promise.then(() => {
            this.fetchLocalInfo();
            this.fetchRemoteInfo();
        });

        return promise;
    }

    public tag(tag: string, message: string): Promise<string[]> {
        const promise: Promise<string[]> = this.repositoryUtility.tag(tag, message);

        promise.then(() => {
            this.fetchLocalInfo();
        });

        return promise;
    }

    private fetchBranches(): Observable<IBranch[]> {
        const obs: Observable<IBranch[]> = this.repositoryUtility.fetchBranches();
        obs.subscribe((branches: IBranch[]) => {

            let activeBranch: IBranch | undefined;
            for (const branch of branches) {
                if (branch.active) {
                    activeBranch = branch;
                    break;
                }
            }

            if (activeBranch === undefined) {
                throw new Error("Failed to find active branch");
            }
            this.activeBranch = activeBranch;
            this.branches = branches;
        });

        return obs;
    }

    private fetchLogs(): Promise<ILog[]> {
        return Repository.bindAndPromise(
            this.repositoryUtility.getLogs(),
            (value: ILog[]) => {
                this.logs = value;
            },
        );
    }

    private fetchRemoteBranches(): Promise<string[]> {
        return Repository.bindAndPromise(
            this.repositoryUtility.getRemoteBranches(),
            (remoteBranches: string[]) => {
                this.remoteBranches = remoteBranches;
            },
        );
    }

    private fetchStatus(): Observable<IStatus[]> {
        this.repositoryUtility
            .getStatus()
            .subscribe((statuses: IStatus[]) => {
                this.status.index = statuses.filter((status: IStatus) =>
                    status.indexed);
                this.status.working = statuses.filter((status: IStatus) =>
                    status.local);

                if (this.preferences.view === ViewType.LOADING) {
                    if (this.status.index.length > 0 || this.status.working.length > 0) {
                        this.preferences.view = ViewType.WORKING_COPY;
                    } else {
                        this.preferences.view = ViewType.LOGS;
                    }
                }
            });

        return this.repositoryUtility.getStatus();
    }

    private fetchTags(): Promise<string[]> {

        return Repository.bindAndPromise(
            this.repositoryUtility.getTags(),
            (value: string[]) => {
                this.tags = value;
            },
        );
    }

    private fetchTrackingBranch(): Promise<string> {

        return Repository.bindAndPromise(
            this.repositoryUtility.getTrackingBranch(),
            (value: string) => {
                this.trackingBranch = value;
            },
        );
    }

    private promiseAll(promises: Array<Promise<any>>): Promise<boolean> {
        const promise: Promise<boolean> = new Promise((resolve, reject) => {
            Promise.all(promises).then((arrays: string[][]) => {
                resolve(true);
            }).catch((e) => {
                reject(e);
            });
        });

        return promise;
    }

}
