import { IBranch } from "./IBranch";
import { ILog } from "./ILog";
import { IStatus } from "./IStatus";
import { ViewType } from "./ViewType";

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
        index: IStatus[];
        working: IStatus[];
    };
    tags?: string[];
}
