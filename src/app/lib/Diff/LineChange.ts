import { ChangeType } from "./DiffUtils";

export interface LineChange {
    oldLineNumber?: number;
    newLineNumber?: number;
    type: ChangeType;
    lineDelimiter: string;
    raw: string;
    line: string;
}
