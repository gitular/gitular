import { Component, ElementRef, HostListener, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-horizontal-splitter",
    templateUrl: "./horizontal-splitter.component.html",
    styleUrls: ["./horizontal-splitter.component.css"],
})
export class HorizontalSplitterComponent implements OnInit {
    public minBottom: number = 100;

    public minTop: number = 100;

    public top: number;

    @Input()
    private readonly initialPosition: number = 300;

    private lastPosition: number;
    private root?: HTMLElement;
    private splitter?: Element;

    public constructor(
        private readonly rootEl: ElementRef,
    ) {
        this.top = 50;
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

        const position: number = +(event.screenY);

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
            const rootRect: ClientRect | DOMRect = this.getRootElement().getBoundingClientRect();
            const parentHeight: number = rootRect.height;
            const splitterHeight: number = this.getSplitter().getBoundingClientRect().height;

            let newTop: number = position - rootRect.top;

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

            const topPercent = newTop / (parentHeight / 100);

            this.top = topPercent;

            console.log({
                parentHeight,
                newTop,
                topPercent,
            });
        }
    }

    private getRootElement(): HTMLElement {
        if (this.root === undefined) {
            throw new Error("Root element undefined");
        }

        return this.root;
    }

    private getSplitter(): Element {
        if (this.splitter === undefined) {
            this.splitter = this.getRootElement().getElementsByClassName("splitter")[0];
        }

        return this.splitter;
    }

}
