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

    public checkout(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.checkout(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public deleteBranch(branch: string): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.deleteBranch(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public pushOrigin(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.pushOrigin(this.path);

        promise.then(() => {
            this.update.emit();
            this.workingCopyUpdate.emit();
        });

        return promise;
    }
    public pull(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.pull(this.path);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public fetch(): Promise<string[]> {

        const promise: Promise<string[]> = RepositoryUtility.fetch(this.path);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }


    public branch(branch: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.branch(this.path, branch);

        promise.then(() => {
            this.update.emit();
        });

        return promise;
    }

    public add(path: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.add(this.path, path);

        promise.then(() => {
            this.workingCopyUpdate.emit();
        });

        return promise;
    }
    public reset(path: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.reset(this.path, path);

        promise.then(() => {
            this.workingCopyUpdate.emit();
        });

        return promise;
    }

    public commit(message: string): Promise<string[]> {
        const promise: Promise<string[]> = RepositoryUtility.commit(this.path, message);

        promise.then(() => {
            this.workingCopyUpdate.emit();
            this.update.emit();
        });

        return promise;
    }

    public commitInfo(commit: string): Observable<string[]> {
        return RepositoryUtility.getCommitInfo(this.path, commit);
    }

    public diff(path: string, staged: boolean): Observable<string[]> {
        return RepositoryUtility.getDiff(this.path, path, staged);
    }

    public getBranches(): Observable<string[]> {

        return RepositoryUtility.getBranches(this.path);
    }

    public fetchTags(): void {

        RepositoryUtility.getTags(this.path).subscribe((tags: string[]) => {
            this.tags = tags;
        });
    }

    public fetchRemoteBranches(): void {
        RepositoryUtility.getRemoteBranches(this.path).subscribe((remoteBranches: string[]) => {
            this.remoteBranches = remoteBranches;
        });
    }

    public fetchLogs(): void {
        RepositoryUtility.getLogs(this.path).subscribe((logs: ILog[]) => {
            this.logs = logs;
        });
    }

    public fetchStatus(): Observable<IStatus[]> {
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