import { ChangeStatusI } from "./ChangeStatusI";
import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { ViewType } from "./ViewType";

export interface GitRepositoryI {
    activeBranch?: IBranch;

    branches?: IBranch[];
    logs?: ILog[];
    path: string;
    preferences: {
        view: ViewType;
    };

    remoteBranches?: string[];
    status: {
        index: ChangeStatusI[];
        working: ChangeStatusI[];
    };
    tags?: string[];
}
