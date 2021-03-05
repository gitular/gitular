/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
    id: string;
}

// declare let window: Window;
interface Window {
    process: any;
    require: any;
}
