import { Component, Input } from '@angular/core';
import { Repository } from 'app/lib/Git/Impl/Repository';
import { DiffUtils } from '../../lib/DiffUtils';
import { Hunk, ParsedDiff, parsePatch } from 'diff';
import { ApplyOptions } from 'app/lib/Git/Impl/RepositoryUtility';

@Component({
    selector: 'app-diff',
    templateUrl: './diff.component.html',
    styleUrls: ['./diff.component.less']
})
export class DiffComponent {

    public diff: string[] | undefined;
 
    public parsedDiffs: ParsedDiff[];

    @Input()
    public repository?: Repository;

    @Input()
    public indexed: boolean = false;

    @Input()
    public applyText: string = 'Add';

    @Input()
    public set lines(val: string[] | undefined) {
        this.diff = val;
        if (val !== undefined) {
            this.parsedDiffs = parsePatch(val.join("\n"));
        } else {
            this.parsedDiffs = [];
        }
    }


    public addHunk(parsedDiff: ParsedDiff, hunk: Hunk) {

        if (this.repository === undefined) {
            console.error('Can\'t add hunk');
            return;
        }

        const diffUtils: DiffUtils = new DiffUtils();

        const partialDiff: ParsedDiff = diffUtils.createPartialDiff(parsedDiff, hunk);
        // Create a new diff
        // const partialDiff: ParsedDiff = this.createPartialDiff(parsedDiff, hunk);
        // if (this.indexed) {
        //     const reversedDiff: ParsedDiff = this.reverseDiff(parsedDiff);
        //     const patch: string[] = this.formatPatch(reversedDiff);
        //     this.repository.apply(patch, { cached: true, verbose: true });
        // }

        const patch: string[] = diffUtils.formatPatch(partialDiff);
        const options: ApplyOptions = { cached: true, verbose: true, reverse: this.indexed };
        console.log(options);
        this.repository.apply(patch, options);
    }


}
