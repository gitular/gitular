export interface IContextMenu {
    // tslint:disable-next-line
    [label: string]: () => Promise<any>;
}
