import { Component, Input } from '@angular/core';
import { Repository } from 'app/lib/Git/Impl/Repository';
import { DiffUtils, Hunk2, ParsedDiff2 } from '../../lib/DiffUtils';
import { ApplyOptions } from 'app/lib/Git/Impl/RepositoryUtility';

@Component({
    selector: 'app-diff',
    templateUrl: './diff.component.html',
    styleUrls: ['./diff.component.less']
})
export class DiffComponent {

    public diff: string[] | undefined;
 
    public parsedDiffs: ParsedDiff2[];

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
            this.parsedDiffs = new DiffUtils().parsePatch(val.join("\n"));
        } else {
            this.parsedDiffs = [];
        }
    }


    public addHunk(parsedDiff: ParsedDiff2, hunk: Hunk2) {

        if (this.repository === undefined) {
            console.error('Can\'t add hunk');
            return;
        }

        const diffUtils: DiffUtils = new DiffUtils();

        const partialDiff: ParsedDiff2 = diffUtils.createPartialDiff(parsedDiff, hunk);
        const patch: string[] = diffUtils.formatPatch(partialDiff);
        const options: ApplyOptions = { cached: true, verbose: true, reverse: this.indexed };
        console.log(options);
        this.repository.apply(patch, options);
    }


}
