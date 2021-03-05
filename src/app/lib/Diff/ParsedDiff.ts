import { Hunk } from "./Hunk";


export interface ParsedDiff {
    index?: string;
    old: {
        filename?: string;
        header?: string;
    };
    new: {
        filename?: string;
        header?: string;
    };
    hunks: Hunk[];
}
