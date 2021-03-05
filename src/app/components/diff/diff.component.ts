import { Component, Input } from '@angular/core';
import { DiffUtils } from '../../lib/Diff/DiffUtils';
import { ParsedDiff } from "../../lib/Diff/ParsedDiff";
import { Hunk } from "../../lib/Diff/Hunk";
import { ApplyOptionsI } from '../../lib/Git/Impl/RepositoryUtility';
import { Repository } from '../../lib/Git/Impl/Repository';

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
            this.parsedDiffs = new DiffUtils().parsePatch(val.join("\n"));
        } else {
            this.parsedDiffs = [];
        }
    }


    public addHunk(parsedDiff: ParsedDiff, hunk: Hunk): void {

        if (this.repository === undefined) {
            console.error('Can\'t add hunk');
            return;
        }

        const diffUtils: DiffUtils = new DiffUtils();

        const partialDiff: ParsedDiff = diffUtils.createPartialDiff(parsedDiff, hunk);
        const patch: string[] = diffUtils.formatPatch(partialDiff);
        const options: ApplyOptionsI = { cached: true, verbose: true, reverse: this.indexed };
        console.log(options);
        this.repository.apply(patch, options);
    }


}
