import {Component, OnInit, ViewChild, ContentChildren, ElementRef, AfterViewInit, HostListener} from '@angular/core';

@Component({
    selector: 'app-vertical-splitter',
    templateUrl: './vertical-splitter.component.html',
    styleUrls: ['./vertical-splitter.component.css']
})
export class VerticalSplitterComponent implements AfterViewInit {


    private splitter: Element;

    private lastPosition = 200;
    constructor(
        private rootEl: ElementRef
    ) {


    }
    ngAfterViewInit(): void {
        const rootElement: HTMLElement = this.rootEl.nativeElement;
        this.splitter = rootElement.getElementsByClassName("splitter")[0];

    }

    left: number;

    minLeft: number = 100;
    minRight: number = 100;

    @HostListener('window:resize', ['$event'])
    resize(event) {
        console.log(event);
        console.log(this.lastPosition)
        this.calcPosition(this.lastPosition);
    }

    splitterDrag(event: DragEvent) {
        event.preventDefault();

        const position: number = +(event.screenX);

        this.calcPosition(position);
    }

    private calcPosition(position: number) {
        if (position > 0) {
            this.lastPosition = position;
            const parentWidth: number = this.splitter.parentElement.getBoundingClientRect().width;
            const splitterWidth: number = this.splitter.getBoundingClientRect().width;

            let newLeft: number = position - this.splitter.parentElement.getBoundingClientRect().left;

            if (newLeft >= parentWidth) {
                // Splitter has gone out of box
                newLeft = parentWidth - splitterWidth - this.minRight;
            }

            if (newLeft < this.minLeft) {
                newLeft = this.minLeft;
            }

            let newRight = parentWidth - newLeft - splitterWidth;
            if (newRight < this.minRight) {
                newLeft = parentWidth - this.minRight - splitterWidth;
                newRight = parentWidth - newLeft - splitterWidth;
            }

            if (newLeft < this.minLeft || newRight < this.minRight) {
                newLeft = (parentWidth - splitterWidth) / 2;
                newRight = (parentWidth - splitterWidth) / 2;
            }

            this.left = newLeft;
        }
    }

    splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }

}
