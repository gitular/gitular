import { IStatus } from "./IStatus";

export interface IBookmark {

    branch?: string;
    id: number;
    name: string;
    path: string;
    statuses?: IStatus[];
}
