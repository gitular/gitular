import {Component, OnInit, ElementRef, AfterViewInit, HostListener, Input} from '@angular/core';

@Component({
    selector: 'app-vertical-splitter',
    templateUrl: './vertical-splitter.component.html',
    styleUrls: ['./vertical-splitter.component.css']
})
export class VerticalSplitterComponent implements OnInit, AfterViewInit {

    private splitter: Element;
    private root: HTMLElement;

    @Input()
    private initialPosition: number = 300;

    public left: number;

    public minLeft: number = 50;
    public minRight: number = 50;

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

    public ngAfterViewInit(): void {
    }

    @HostListener('window:resize', ['$event'])
    public resize(event) {
        this.calcPosition(this.lastPosition);
    }

    public splitterDrag(event: DragEvent) {
        event.preventDefault();

        const position: number = +(event.screenX)- this.root.getBoundingClientRect().left;

        this.calcPosition(position);
    }

    private calcPosition(position: number) {
        if (position > 0) {
            this.lastPosition = position;
            
            const parentWidth: number = this.root.getBoundingClientRect().width;
            const splitterWidth: number = this.splitter.getBoundingClientRect().width;

            let newLeft: number = position;

            if (newLeft < this.minLeft) {
                console.log('out of range - l');
                newLeft = this.minLeft;
            }
            
            if (newLeft > (parentWidth - this.minRight)) {
                console.log('out of range - r');
                newLeft = parentWidth - this.minRight;
            }
            
            
            let leftPerc = newLeft / (parentWidth / 100);
            
            console.log({
                parent: this.root,
                parentBound: this.root.getBoundingClientRect(),
                position,
                leftPerc,
                newLeft,
                parentWidth,
            });
//            if (leftPerc <= 0) {
//                leftPerc = 5;
//            }
            
            this.left = leftPerc;
        }
    }

    public splitterDragstart(event: DragEvent) {
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        event.dataTransfer.setDragImage(img, 0, 0);
    }

}
