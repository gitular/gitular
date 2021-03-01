import { Component, Input, OnInit } from "@angular/core";

import { Repository } from "../../lib/Git/Impl/Repository";
import { ContextMenuBuilderService } from "../../services/context-menu-builder.service";

@Component({
    selector: "app-tags",
    templateUrl: "./tags.component.html",
    styleUrls: ["./tags.component.css"],
})
export class TagsComponent implements OnInit {

    public newTag: {
        message: string;
        name: string;
    };

    @Input()
    public repository?: Repository;

    public showModal: boolean = false;

    public constructor(
        private readonly contextMenuBuilderService: ContextMenuBuilderService,
    ) {
        // Reset
        this.newTag = {
            name: "",
            message: "",
        };
    }

    public contextMenu(tag: string) {

        this.contextMenuBuilderService.show({
            Delete: () => this.deleteTag(tag),
        });
    }

    public createTag() {
        const tagName: string = this.newTag.name;
        const tagMessage: string = this.newTag.message;

        this.getRepository().tag(tagName, tagMessage).then(() => {

            // Hide modal
            this.showModal = false;

            // Reset
            this.newTag = {
                name: "",
                message: "",
            };

        }).catch((e) => {
            console.log(e);
        });
    }

    public displayModal() {
        this.showModal = true;
    }

    public hideModal() {
        this.showModal = false;
    }

    public ngOnInit() {

        this.newTag = {
            name: "",
            message: "",
        };
    }

    private deleteTag(tag: string): Promise<void> {

        return this.getRepository().deleteTag(tag);
    }

    private getRepository(): Repository {
        if (this.repository === undefined) {
            throw new Error("Repository undefined");
        }

        return this.repository;
    }
}
