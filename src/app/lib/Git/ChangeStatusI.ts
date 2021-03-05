import { FileStatusI } from "./FileStatusI";


export interface ChangeStatusI {
    indexed: boolean;
    status: FileStatusI;
    path: string;
    origPath?: string;
}
