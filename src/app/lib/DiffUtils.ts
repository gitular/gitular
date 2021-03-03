import { ParsedDiff, Hunk, parsePatch } from "diff";
import { ChangeStatus } from "./Git/IRepository";

type ChangeType = "addition" | "deletion" | "none";

export interface ParsedDiff2 {
    index?: string;
    old: {
        filename?: string;
        header?: string;
    },
    new: {
        filename?: string;
        header?: string;
    },
    hunks: Hunk2[];
}
interface LineChange {
    oldLineNumber?: number;
    newLineNumber?: number;
    type: ChangeType;
    lineDelimiter: string;
    raw: string;
    line: string;
}

export interface Hunk2 {
    old: {
        start: number;
        lines: number;
    },
    new: {
        start: number;
        lines: number;
    },
    lines: LineChange[];
}
export class DiffUtils {

    public parsePatch(patch: string): ParsedDiff2[] {
        const parsed: ParsedDiff[] = parsePatch(patch);

        return this.processDiffs(parsed);
    }


    private processDiffs(diffs: ParsedDiff[]): ParsedDiff2[] {
        return diffs.map((diff: ParsedDiff) => {
            return this.processDiff(diff)
        });
    }
    private processDiff(diff: ParsedDiff): ParsedDiff2 {
        return {
            index: diff.index,
            new: {
                filename: diff.newFileName,
                header: diff.newHeader,
            },
            old: {
                filename: diff.oldFileName,
                header: diff.oldHeader,
            },
            hunks: this.processHunks(diff.hunks),
        };
    }

    private processHunks(hunks: Hunk[]): Hunk2[] {
        return hunks.map((hunk: Hunk) => {
            return this.processHunk(hunk);
        });
    }

    private processHunk(hunk: Hunk): Hunk2 {
        return {
            new: {
                start: hunk.newStart,
                lines: hunk.newLines,
            },
            old: {
                start: hunk.oldStart,
                lines: hunk.oldLines,
            },
            lines: this.processLines(hunk.lines, hunk.linedelimiters, hunk.oldStart),
        }
    }
    private processLines(lines: string[], lineDelimiters: string[], lineNumber: number): LineChange[] {
        // TODO: line counts should count according to deletion or addtion
        const processedLines: LineChange[] = [];


        let oldCount: number = lineNumber;
        let newCount: number = lineNumber;

        for (let index = 0; index < lines.length; index++) {
            const line: string = lines[index];
            const lineDelimiter: string = lineDelimiters[index];

            // TODO: this won't do line counts correctly
            let type: ChangeType = this.getChangeType(line);
            if (type === "addition") {
                processedLines.push(this.processLine(line, lineDelimiter, oldCount, newCount, type));
                newCount++;
            } else if (type === "deletion") {
                processedLines.push(this.processLine(line, lineDelimiter, oldCount, newCount, type));
                oldCount++;
            } else {
                processedLines.push(this.processLine(line, lineDelimiter, oldCount, newCount, type));
                newCount++;
                oldCount++;
            }
        }

        return processedLines;
    }

    private processLine(line: string, lineDelimiter: string, oldLineNumber: number, newLineNumber: number, type: ChangeType): LineChange {

        return {
            raw: line,
            line: line.substr(1),
            lineDelimiter,
            oldLineNumber,
            newLineNumber,
            type,
        }
    }

    private getChangeType(line: string): ChangeType {
        let type: ChangeType;
        if (line.startsWith('+')) {
            type = "addition";
        } else if (line.startsWith('-')) {
            type = "deletion";
        } else {
            type = "none";
        }
        return type;
    }

    /**
     * Essentially clones the given diff with just the given Hunk.
     *
     * @param parsedDiff 
     * @param hunk 
     */
    public createPartialDiff(parsedDiff: ParsedDiff2, hunk: Hunk2): ParsedDiff2 {
        return {
            index: parsedDiff.index,
            old: {
                filename: parsedDiff.old.filename,
                header: parsedDiff.old.header
            },
            new: {
                filename: parsedDiff.new.filename,
                header: parsedDiff.new.header
            },
            hunks: parsedDiff.hunks.filter((currentHunk: Hunk2): boolean => {
                return currentHunk === hunk;
            }),
        };
    }

    /**
     * Convert a parsed diff to a string.
     *
     * @param parsedDiff 
     */
    public formatPatch(parsedDiff: ParsedDiff2): string[] {
        const lines: string[] = [];
        if (parsedDiff.old.filename == parsedDiff.new.filename) {
            lines.push('Index: ' + parsedDiff.old.filename);
        }
        lines.push('diff ' + parsedDiff.old.filename + ' ' + parsedDiff.new.filename);
        lines.push('--- ' + parsedDiff.old.filename + this.processHeader(parsedDiff.old.header));
        lines.push('+++ ' + parsedDiff.new.filename + this.processHeader(parsedDiff.new.header));

        for (let i = 0; i < parsedDiff.hunks.length; i++) {
            const hunk = parsedDiff.hunks[i];
            const hunkLineNumbers = this.formatHunkLineNumbers(hunk);
            lines.push(hunkLineNumbers);
            for (const hunkLine of hunk.lines) {
                lines.push(hunkLine.raw);
            }
        }

        lines.push('');
        return lines;
    }

    private formatHunkLineNumbers(hunk: Hunk2): string {
        if (hunk.old.lines === 0) {
            hunk.old.start -= 1;
        }
        if (hunk.new.lines === 0) {
            hunk.new.start -= 1;
        }
        return `@@ -${hunk.old.start},${hunk.old.lines} +${hunk.new.start},${hunk.new.lines} @@`;
    }

    private processHeader(header?: string): string {
        if (header === undefined) {
            return '';
        } else {
            return `	${header}`;
        }
    }
}