
export interface DiffOptionsI extends Record<string, string | boolean | undefined> {
    staged?: boolean;
    cached?: boolean;
}
