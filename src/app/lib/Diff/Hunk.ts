import { LineChange } from "./LineChange";

export interface Hunk {
    old: {
        start: number;
        lines: number;
    };
    new: {
        start: number;
        lines: number;
    };
    lines: LineChange[];
}
