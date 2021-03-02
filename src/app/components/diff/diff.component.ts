import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-diff',
    templateUrl: './diff.component.html',
    styleUrls: ['./diff.component.less']
})
export class DiffComponent {

    @Input()
    public lines: string[];

}
