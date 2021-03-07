
export interface ApplyOptionsI extends Record<string, string | boolean | undefined> {
    cached?: boolean;
    reverse?: boolean;
    verbose?: boolean;
}
