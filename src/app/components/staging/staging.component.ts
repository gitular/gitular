import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Repository } from 'app/lib/Git/Impl/Repository';
import { IStatus } from 'app/lib/Git/IStatus';
import { ContextMenuBuilderService } from 'app/services/context-menu-builder.service';
import { stat } from 'fs';

@Component({
    selector: 'app-staging',
    templateUrl: './staging.component.html',
    styleUrls: ["./staging.component.less"],
})
export class StagingComponent {

    @Input()
    public repository: Repository;

    @Output()
    public select = new EventEmitter<IStatus | undefined>();

    public selected: IStatus | undefined = undefined;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) { }

    public add(path: string) {
        return this.repository.add(path);
    }

    public reset(path: string) {
        return this.repository.reset(path);
    }

    public discard(path: string) {
        return this.repository.discardChanges(path);
    }

    public selectStatus(status: IStatus) {
        if (status === this.selected) {
            this.selected = undefined;
        } else {
            this.selected = status;
        }
        this.select.emit(this.selected);
    }

    public contextMenu(status: IStatus) {

        if (!status.indexed) {
            this.contextMenuBuilderService.show({
                Index: () => this.add(status.path),
                Discard: () => this.discard(status.path),
            });
        } else {
            this.contextMenuBuilderService.show({
                Reset: () => this.reset(status.path),
            });
        }
    }
}
