import {Component, OnInit, ElementRef, AfterViewInit, HostListener, Input} from '@angular/core';

@Component({
    selector: 'app-vertical-splitter',
    templateUrl: './vertical-splitter.component.html',
    styleUrls: ['./vertical-splitter.component.css']
})
export class VerticalSplitterComponent implements OnInit, AfterViewInit {

    private splitter: Element;

    @Input()
    private initialPosition: number = 300;

    public left: number;

    public minLeft: number = 100;
    public minRight: number = 100;

    private lastPosition: number;

    public constructor(
        private rootEl: ElementRef
    ) {}

    public ngOnInit(): void {
        this.lastPosition = this.initialPosition;
        const rootElement: HTMLElement = this.rootEl.nativeElement;
        this.splitter = rootElement.getElementsByClassName("splitter")[0];
        this.calcPosition(this.lastPosition)
    }

    public ngAfterViewInit(): void {
    }

    @HostListener('window:resize', ['$event'])
    public resize(event) {
        this.calcPosition(this.lastPosition);
    }

    public splitterDrag(event: DragEvent) {
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
            
            this.left = newLeft / (parentWidth / 100)
        }
    }

    public splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }

}
