import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChangeStatusI } from '../../lib/Git/ChangeStatusI';
import { GitRepository } from '../../lib/Git/Impl/GitRepository';
import { ContextMenuBuilderService } from '../../services/context-menu-builder.service';

@Component({
    selector: 'app-status-table',
    templateUrl: './status-table.component.html',
    styleUrls: ['./status-table.component.less']
})
export class StatusTableComponent {

    @Input()
    public repository: GitRepository;

    @Input()
    public title: string;

    @Input()
    public statuses: ChangeStatusI[];

    @Output()
    public select = new EventEmitter<ChangeStatusI | undefined>();

    public selected: ChangeStatusI | undefined = undefined;

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

    public selectStatus(status: ChangeStatusI) {
        if (status === this.selected) {
            this.selected = undefined;
        } else {
            this.selected = status;
        }
        this.select.emit(this.selected);
    }

    public contextMenu(status: ChangeStatusI) {

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
