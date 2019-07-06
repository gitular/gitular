import {Component, OnInit, ElementRef, AfterViewInit, HostListener, Input} from '@angular/core';

@Component({
    selector: 'app-horizontal-splitter',
    templateUrl: './horizontal-splitter.component.html',
    styleUrls: ['./horizontal-splitter.component.css']
})
export class HorizontalSplitterComponent implements OnInit {

    private splitter: Element;
    private root: HTMLElement;

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
        this.root = this.rootEl.nativeElement;
        this.splitter = this.root.getElementsByClassName("splitter")[0];
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
            const parentHeight: number = this.root.getBoundingClientRect().height;
            const splitterHeight: number = this.splitter.getBoundingClientRect().height;

            let newTop: number = position - this.root.getBoundingClientRect().top;

            if (newTop >= parentHeight) {
                // Splitter has gone out of box
                newTop = parentHeight - splitterHeight - this.minBottom;
            }

            if (newTop < this.minTop) {
                newTop = this.minTop;
            }

            let newBottom = parentHeight - newTop - splitterHeight;
            if (newBottom < this.minBottom) {
                newTop = parentHeight - this.minBottom - splitterHeight;
                newBottom = parentHeight - newTop - splitterHeight;
            }

            if (newTop < this.minTop || newBottom < this.minBottom) {
                newTop = (parentHeight - splitterHeight) / 2;
                newBottom = (parentHeight - splitterHeight) / 2;
            }
            
            const topPercent  = newTop / (parentHeight / 100);
            
            this.top = topPercent;
            
            console.log({
                parentHeight,
                newTop,
                topPercent,
            });
        }
    }

    public splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }

}
