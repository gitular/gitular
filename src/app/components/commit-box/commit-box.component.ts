import { Component, Input, OnInit } from '@angular/core';
import { GitRepository } from '../../lib/Git/Impl/GitRepository';

@Component({
    selector: 'app-commit-box',
    templateUrl: './commit-box.component.html'
})
export class CommitBoxComponent {

    public commitMessage: string;
    public pushOnCommit: boolean;

    @Input()
    public repository: GitRepository;

    public constructor() {
        this.commitMessage = "";
        this.pushOnCommit = true;
    }

    public async commit(): Promise<void> {
        await this.repository.commit(this.commitMessage);
        this.commitMessage = "";
        if (this.pushOnCommit) {
            await this.repository.pushOrigin();
        }
    }
}
