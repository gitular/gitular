import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ViewType} from '../../lib/ViewType';
import {Repository} from '../../lib/Repository';
import {ContextMenuBuilderService} from '../../services/context-menu-builder.service';

@Component({
    selector: 'app-repository-sidebar',
    templateUrl: './repository-sidebar.component.html',
    styleUrls: ['./repository-sidebar.component.css']
})
export class RepositorySidebarComponent implements OnInit {

    @Input()
    repository: Repository;

    public constructor(
        private contextMenuBuilderService: ContextMenuBuilderService
    ) {

    }

    ngOnInit(
    ) {
    }

    public refreshLocal() {
        this.repository.fetchLocalInfo();
    }

    pull() {
        this.repository.pull();
    }

    push() {
        this.repository.pushOrigin();
    }

    fetch() {
        this.repository.fetch();
    }

    workingCopy() {
        this.repository.fetchLocalInfo();
        this.repository.preferences.view = ViewType.WORKING_COPY;
    }

    logs() {
        this.repository.fetchRemoteInfo();
        this.repository.preferences.view = ViewType.LOGS;
    }

    workingCopyContextMenu() {
        this.contextMenuBuilderService.show({
            'Refresh': () => {
                return this.repository.fetchLocalInfo();
            }
        });
    }

}
