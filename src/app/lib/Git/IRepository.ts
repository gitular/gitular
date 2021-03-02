import { FileStatus } from "./FileStatus";
import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { ViewType } from "./ViewType";

export interface ChangeStatus {
    indexed: boolean;
    status: FileStatus;
    path: string;
    origPath?: string;
}

export interface IRepository {
    activeBranch?: IBranch;

    branches?: IBranch[];
    logs?: ILog[];
    path: string;
    preferences: {
        view: ViewType;
    };

    remoteBranches?: string[];
    status: {
        index: ChangeStatus[];
        working: ChangeStatus[];
    };
    tags?: string[];
}
