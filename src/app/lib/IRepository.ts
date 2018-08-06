import {ILog} from "./ILog";
import {ViewType} from "./ViewType";
import {IStatus} from "./RepositoryUtility";

export interface IRepository {
    preferences: {
        view: ViewType
    },
    path: string;
    tags: Array<string>;
    remoteBranches: Array<string>;
    logs: Array<ILog>;
    status: {
        working: IStatus[];
        index: IStatus[];
    }
}
