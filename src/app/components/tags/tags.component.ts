import {Component, OnInit, Input} from '@angular/core';
import {Repository} from '../../lib/Repository';
import {remote} from 'electron';
import {ContextMenuBuilderService} from '../../services/context-menu-builder.service';

@Component({
    selector: 'app-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {

    
    @Input()
    repository: Repository;

    showModal: boolean = false;

    newTag: {
        name: string;
        message: string;
    }

    public constructor(
        private contextMenuBuilderService: ContextMenuBuilderService
    ) {}

    public ngOnInit() {

        this.newTag = {
            name: '',
            message: '',
        }
    }

    public displayModal() {
        this.showModal = true;
    }

    public hideModal() {
        this.showModal = false;
    }

    private deleteTag(tag: string) {

        return this.repository.deleteTag(tag);
    }

    public createTag() {
        const tagName: string = this.newTag.name;
        const tagMessage: string = this.newTag.message;

        this.repository.tag(tagName, tagMessage).then(() => {
            
            // Hide modal
            this.showModal = false;

            // Reset
            this.newTag = {
                name: '',
                message: '',
            }

        }).catch(e => {
            console.log(e);
        });
    }

    public contextMenu(tag: string) {

        this.contextMenuBuilderService.show({
            'Delete': () => this.deleteTag(tag),
        });
    }
}
