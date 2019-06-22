import {ILog} from "./ILog";
import {IBranch} from './IBranch';
import {ViewType} from "./ViewType";
import {IStatus} from "./RepositoryUtility";

export interface IRepository {
    preferences: {
        view: ViewType
    },
    path: string;
    tags: Array<string>;
    
    branches: IBranch[];
    activeBranch: IBranch;

    remoteBranches: Array<string>;
    logs: Array<ILog>;
    status: {
        working: IStatus[];
        index: IStatus[];
    }
}
