import { IStatus } from "./IStatus";

export interface IBookmark {
    id: number;
    name: string;
    path: string;

    statuses?: IStatus[];
}
