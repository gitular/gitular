import { Component, ElementRef, HostListener, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-vertical-splitter",
    templateUrl: "./vertical-splitter.component.html",
    styleUrls: ["./vertical-splitter.component.css"],
})
export class VerticalSplitterComponent implements OnInit {

    public left: number;

    public minLeft: number = 50;
    public minRight: number = 50;

    @Input()
    private readonly initialPosition: number = 300;

    private lastPosition: number;
    private root?: HTMLElement;

    public constructor(
        private readonly rootEl: ElementRef,
    ) {
        this.left = 50;
        this.lastPosition = 50;
    }

    public ngOnInit(): void {
        this.lastPosition = this.initialPosition;
        this.root = this.rootEl.nativeElement;
        this.calcPosition(this.lastPosition);
    }

    @HostListener("window:resize", ["$event"])
    public resize(event: Event) {
        this.calcPosition(this.lastPosition);
    }

    public splitterDrag(event: DragEvent) {
        event.preventDefault();

        const position: number = +(event.screenX) - this.getRootElement().getBoundingClientRect().left;

        this.calcPosition(position);
    }

    public splitterDragstart(event: DragEvent) {
        const img = new Image();
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
        event.dataTransfer.setDragImage(img, 0, 0);
    }

    private calcPosition(position: number) {
        if (position > 0) {
            this.lastPosition = position;

            const parentWidth: number = this.getRootElement().getBoundingClientRect().width;

            let newLeft: number = position;

            if (newLeft < this.minLeft) {
                console.log("out of range - l");
                newLeft = this.minLeft;
            }

            if (newLeft > (parentWidth - this.minRight)) {
                console.log("out of range - r");
                newLeft = parentWidth - this.minRight;
            }

            const leftPerc = newLeft / (parentWidth / 100);

            console.log({
                parent: this.getRootElement(),
                parentBound: this.getRootElement().getBoundingClientRect(),
                position,
                leftPerc,
                newLeft,
                parentWidth,
            });

            this.left = leftPerc;
        }
    }

    private getRootElement(): HTMLElement {
        if (this.root === undefined) {
            throw new Error("Root element undefined");
        }

        return this.root;
    }

}
