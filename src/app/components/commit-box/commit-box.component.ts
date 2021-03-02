import { Component, Input, OnInit } from '@angular/core';
import { Repository } from 'app/lib/Git/Impl/Repository';
import { RepositoryService } from 'app/services/repository.service';

@Component({
    selector: 'app-commit-box',
    templateUrl: './commit-box.component.html'
})
export class CommitBoxComponent {

    public commitMessage: string;
    public pushOnCommit: boolean;

    @Input()
    public repository: Repository;

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
