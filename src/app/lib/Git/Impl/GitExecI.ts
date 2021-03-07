import { DiffOptionsI } from "./DiffOptionsI";
import { ApplyOptionsI } from "./ApplyOptionsI";

export interface GitExecI {
	add(path: string): Promise<string[]>;
    checkout(options: {
            b?: string,
        }, args: string[]): Promise<string[]>;
    commit(options: {message: string}): Promise<string[]>;
    branch(options: { verbose?: boolean, 'set-upstream-to'?: string, remotes?: boolean, delete?: boolean }, args: string[]): Promise<string[]>;
    tag(options: { delete?: boolean, annotate?: string, message?: string }, args: string[]): Promise<string[]>;
    push(options: { 'set-upstream'?: string, delete?: boolean, }, args: string[]): Promise<string[]>;
    fetch(): Promise<string[]>;
    diff(options: DiffOptionsI, args: string[]): Promise<string[]>;
    show(options: string[]): Promise<string[]>;
    log(options: {
        all: boolean,
        graph: boolean,
        format: string,
    }): Promise<string[]>;
    status(options: { short: boolean, 'untracked-files': boolean }): Promise<string[]>;
    revParse(options: { 'abbrev-ref': boolean, 'symbolic-full-name': string }): Promise<string[]>;
    merge(branch: string): Promise<string[]>;
    pull(args: string[]): Promise<string[]>;
    reset(path: string): Promise<string[]>;
    apply(patchOptions: ApplyOptionsI, patch: string[]): Promise<string[]>;
}