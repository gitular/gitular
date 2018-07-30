import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-vertical-splitter',
    templateUrl: './vertical-splitter.component.html',
    styleUrls: ['./vertical-splitter.component.css']
})
export class VerticalSplitterComponent implements OnInit {

    constructor() {}

    ngOnInit() {
        this.left = 200;
    }

    left: number;
    right: number;

    splitterDrag(event: DragEvent) {
        event.preventDefault();

        const position: number = +(event.screenX);
        
        if (position > 0) {
            
            this.left = position - event.srcElement.parentElement.getBoundingClientRect().left;
            this.right = event.srcElement.parentElement.getBoundingClientRect().width
                - this.left
                - event.srcElement.getBoundingClientRect().width;
        }
    }

    splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }
}
