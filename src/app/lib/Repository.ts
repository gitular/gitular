import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {RepositoryUtility, IStatus} from './RepositoryUtility';
import {ILog} from './ILog';
import {EventEmitter, Output} from '@angular/core';
import {IRepository} from './IRepository';
import {ViewType} from './ViewType';

export class Repository
    implements IRepository {

    preferences: {
        view: ViewType;
    };
    tags: string[];
    remoteBranches: string[];
    logs: ILog[];
    reflog: string[];
    status: {
        working: IStatus[];
        index: IStatus[]
    }

    @Output()
    update: EventEmitter<string> = new EventEmitter<string>();
    @Output()
    workingCopyUpdate: EventEmitter<string> = new EventEmitter<string>();

    constructor(public path: string) {
        this.preferences = {view: ViewType.LOGS};
        this.status = {
            working: [],
            index: []
        }

    }

    public checkout(branch: string): Promise<string> {
        const promise: Promise<string> = RepositoryUtility.checkout(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public deleteBranch(branch: string): Promise<string> {

        const promise: Promise<string> = RepositoryUtility.deleteBranch(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public push(): Promise<string> {

        const promise: Promise<string> = RepositoryUtility.push(this.path);

        promise.then(() => {
            this.update.emit();
            this.workingCopyUpdate.emit();
        });

        return promise;
    }
    public pull(): Promise<string> {

        const promise: Promise<string> = RepositoryUtility.pull(this.path);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public fetch(): Promise<string> {

        const promise: Promise<string> = RepositoryUtility.fetch(this.path);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }


    public branch(branch: string): Promise<string> {
        const promise: Promise<string> = RepositoryUtility.branch(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public add(path: string): Promise<string> {
        const promise: Promise<string> = RepositoryUtility.add(this.path, path);

        promise.then(() => {
            this.workingCopyUpdate.emit();
        });

        return promise;
    }
    public reset(path: string): Promise<string> {
        const promise: Promise<string> = RepositoryUtility.reset(this.path, path);

        promise.then(() => {
            this.workingCopyUpdate.emit();
        });

        return promise;
    }

    public commit(message: string): Promise<string> {
        const promise: Promise<string> = RepositoryUtility.commit(this.path, message);

        promise.then(() => {
            this.workingCopyUpdate.emit();
            this.update.emit();
        });

        return promise;
    }

    public commitInfo(commit: string): Observable<string> {
        return RepositoryUtility.getCommitInfo(this.path, commit);
    }

    public getBranches(): Observable<string> {

        return RepositoryUtility.getBranches(this.path);
    }

    public fetchTags(): void {

        this.tags = [];
        RepositoryUtility.getTags(this.path).subscribe((tag: string) => {
            this.tags.push(tag);
        });
    }

    public fetchRemoteBranches(): void {
        this.remoteBranches = [];
        RepositoryUtility.getRemoteBranches(this.path).subscribe((remoteBranch: string) => {
            this.remoteBranches.push(remoteBranch);
        });
    }

    public fetchLogs(): void {
        this.logs = [];
        RepositoryUtility.getLogs(this.path).subscribe((log: ILog) => {
            this.logs.push(log)
        });
    }

    public fetchStatus(): Observable<IStatus> {

        this.status.working = [];
        this.status.index = [];
        RepositoryUtility
            .getStatus(this.path)
            .subscribe((status: IStatus) => {
                if (status.indexed) {
                    this.status.index.push(status);
                }
                if (status.local) {
                    this.status.working.push(status);
                }
            });

        return RepositoryUtility.getStatus(this.path);
    }

}