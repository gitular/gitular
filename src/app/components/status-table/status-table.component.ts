import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Repository } from '../../lib/Git/Impl/Repository';
import { ContextMenuBuilderService } from '../../services/context-menu-builder.service';
import { ChangeStatus } from 'app/lib/Git/IRepository';

@Component({
    selector: 'app-status-table',
    templateUrl: './status-table.component.html',
    styleUrls: ['./status-table.component.less']
})
export class StatusTableComponent {

    @Input()
    public repository: Repository;

    @Input()
    public title: string;

    @Input()
    public statuses: ChangeStatus[];

    @Output()
    public select = new EventEmitter<ChangeStatus | undefined>();

    public selected: ChangeStatus | undefined = undefined;

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

    public selectStatus(status: ChangeStatus) {
        if (status === this.selected) {
            this.selected = undefined;
        } else {
            this.selected = status;
        }
        this.select.emit(this.selected);
    }

    public contextMenu(status: ChangeStatus) {

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
