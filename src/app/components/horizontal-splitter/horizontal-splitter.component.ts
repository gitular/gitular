import {Component, OnInit, HostListener, ElementRef, Input} from '@angular/core';

@Component({
    selector: 'app-horizontal-splitter',
    templateUrl: './horizontal-splitter.component.html',
    styleUrls: ['./horizontal-splitter.component.css']
})
export class HorizontalSplitterComponent implements OnInit {

    private splitter: Element;

    @Input()
    private initialPosition: number = 300;

    public top: number;

    public minTop: number = 100;
    public minBottom: number = 100;

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

    @HostListener('window:resize', ['$event'])
    public resize(event) {
        this.calcPosition(this.lastPosition);
    }

    public splitterDrag(event: DragEvent) {
        event.preventDefault();

        const position: number = +(event.screenY);

        this.calcPosition(position);
    }

    private calcPosition(position: number) {
        if (position > 0) {
            this.lastPosition = position;

            const rootElement: Element = this.rootEl.nativeElement;
            const parentHeight: number = rootElement.getBoundingClientRect().height;
            let newTop: number = position - rootElement.getBoundingClientRect().top;

            if (newTop < this.minTop) {
                newTop = this.minTop;
            }
            if (newTop > parentHeight - this.minBottom) {
                newTop = parentHeight - this.minBottom;
            }

            this.top = newTop;
        }
    }

    public splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }

}
