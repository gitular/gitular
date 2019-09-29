import {IStatus} from "./RepositoryUtility";

export interface IBookmark {
    name: string;
    id: number;
    path: string;

    statuses?: IStatus[]
}
