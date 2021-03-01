
import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { IStatus } from "./IStatus";

export interface RepositoryUtilityI {
	add(path: string): Promise<string[]>;
    branch(branch: string): Promise<string[]>;
    checkout(branch: string): Promise<string[]>;
    checkoutRemote(remoteBranch: string): Promise<string[]>;
    commit(message: string): Promise<string[]>;
    deleteBranch(branch: string): Promise<string[]>;
    deleteLocalTag(tag: string): Promise<string[]>;
    deleteRemoteBranch(remoteBranch: string): Promise<string[]>;
    deleteRemoteTag(tag: string, remote: string): Promise<string[]>;
    discardChanges(filePath: string): Promise<string[]>;
    fetch(): Promise<string[]>;
    fetchBranches(): Promise<IBranch[]>;
    getCommitInfo(commit: string): Promise<string[]>;
    getDiff(filePath: string, staged: boolean): Promise<string[]>;
    getLogs(): Promise<ILog[]>;
    getRemoteBranches(): Promise<string[]>;
    getStatus(): Promise<IStatus[]>;
    getTags(): Promise<string[]>;
    getTrackingBranch(): Promise<string>;
    merge(branch: string): Promise<string[]>;
    pull(branch: string | undefined): Promise<string[]>;
    pullRemote(remoteBranch: string): Promise<string[]>;
    pushOrigin(): Promise<string[]>;
    reset(path: string): Promise<string[]>;
    setUpstream(remoteBranch: string): Promise<string[]>;
    tag(tag: string, message: string): Promise<string[]>;
}