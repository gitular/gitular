import { ParsedDiff, Hunk } from "diff";

export class DiffUtils {

    /**
     * Essentially clones the given diff with just the given Hunk.
     *
     * @param parsedDiff 
     * @param hunk 
     */
    public createPartialDiff(parsedDiff: ParsedDiff, hunk: Hunk): ParsedDiff {
        return {
            index: parsedDiff.index,
            oldFileName: parsedDiff.oldFileName,
            newFileName: parsedDiff.newFileName,
            oldHeader: parsedDiff.oldHeader,
            newHeader: parsedDiff.newHeader,
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
        if (parsedDiff.oldFileName == parsedDiff.newFileName) {
            lines.push('Index: ' + parsedDiff.oldFileName);
        }
        lines.push('diff ' + parsedDiff.oldFileName + ' ' + parsedDiff.newFileName);
        lines.push('--- ' + parsedDiff.oldFileName + this.processHeader(parsedDiff.oldHeader));
        lines.push('+++ ' + parsedDiff.newFileName + this.processHeader(parsedDiff.newHeader));

        for (let i = 0; i < parsedDiff.hunks.length; i++) {
            const hunk = parsedDiff.hunks[i];
            const hunkLineNumbers = this.formatHunkLineNumbers(hunk);
            lines.push(hunkLineNumbers);
            for (const hunkLine of hunk.lines) {
                lines.push(hunkLine);
            }
        }

        lines.push('');
        return lines;
    }

    private formatHunkLineNumbers(hunk: Hunk): string {
        if (hunk.oldLines === 0) {
            hunk.oldStart -= 1;
        }
        if (hunk.newLines === 0) {
            hunk.newStart -= 1;
        }
        return `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
    }

    private processHeader(header?: string): string {
        if (header === undefined) {
            return '';
        } else {
            return `	${header}`;
        }
    }
}