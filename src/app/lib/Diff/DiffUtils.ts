import { ParsedDiff as DiffParsedDiff, Hunk as DiffHunk, parsePatch } from "diff";
import { ChangeStatusI } from "../Git/ChangeStatusI";
import { Hunk } from "./Hunk";
import { LineChange } from "./LineChange";
import { ParsedDiff } from "./ParsedDiff";

export type ChangeType = "addition" | "deletion" | "none";

export class DiffUtils {

    public parsePatch(patch: string): ParsedDiff[] {
        const parsed: DiffParsedDiff[] = parsePatch(patch);

        return this.processDiffs(parsed);
    }


    private processDiffs(diffs: DiffParsedDiff[]): ParsedDiff[] {
        return diffs.map((diff: DiffParsedDiff) => {
            return this.processDiff(diff);
        });
    }
    private processDiff(diff: DiffParsedDiff): ParsedDiff {
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

    private processHunks(hunks: DiffHunk[]): Hunk[] {
        return hunks.map((hunk: DiffHunk) => {
            return this.processHunk(hunk);
        });
    }

    private processHunk(hunk: DiffHunk): Hunk {
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
        };
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
            const type: ChangeType = this.getChangeType(line);
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
        };
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
    public createPartialDiff(parsedDiff: ParsedDiff, hunk: Hunk): ParsedDiff {
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
            hunks: parsedDiff.hunks.filter((currentHunk: Hunk): boolean => {
                return currentHunk === hunk;
            }),
        };
    }

    /**
     * Convert a parsed diff to a string.
     *
     * @param parsedDiff 
     */
    public formatPatch(parsedDiff: ParsedDiff): string[] {
        const lines: string[] = [];
        if (parsedDiff.old.filename == parsedDiff.new.filename) {
            lines.push('Index: ' + parsedDiff.old.filename);
        }
        const oldHeader: string = this.processHeader(parsedDiff.old.header);
        const newHeader: string = this.processHeader(parsedDiff.new.header);

        lines.push(`diff ${parsedDiff.old.filename} ` + ' ' + parsedDiff.new.filename);
        lines.push(`--- ${parsedDiff.old.filename} ${oldHeader}`);
        lines.push(`+++ ${parsedDiff.new.filename} ${newHeader}`);

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

    private formatHunkLineNumbers(hunk: Hunk): string {
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