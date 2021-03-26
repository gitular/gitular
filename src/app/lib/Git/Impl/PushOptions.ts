export interface PushOptionsI extends Record<string, string | boolean | undefined> {
    'set-upstream'?: boolean;
    delete?: boolean;
}
