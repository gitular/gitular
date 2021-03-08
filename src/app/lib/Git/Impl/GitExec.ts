import { ExecUtil } from "../../Exec/ExecUtil";
import { DiffOptionsI } from "./DiffOptionsI";
import { ApplyOptionsI } from "./ApplyOptionsI";

export class GitExec {

    public constructor(
        private readonly path: string,
        private readonly execUtil: ExecUtil,
    ) { }

    public async add(path: string): Promise<string[]> {
        return this.run('add', {}, [path]);
    }

    public async checkout(
        options: {
            b?: string,
        },
        ...args: string[]
    ): Promise<string[]> {
        return this.run('checkout', options, args);
    }

    public async commit(options: { message: string }): Promise<string[]> {
        return this.run('commit', options);
    }

    public async branch(options: { '-vv'? : boolean, verbose?: boolean, 'set-upstream-to'?: string, remotes?: boolean, delete?: boolean }, ...args: string[]): Promise<string[]> {
        return this.run('branch', options, args);
    }

    public async tag(options: { delete?: boolean, annotate?: string, message?: string }, ...args: string[]): Promise<string[]> {
        return this.run('tag', options, args);
    }

    public async push(options: { 'set-upstream'?: string, delete?: boolean, }, ...args: string[]): Promise<string[]> {
        return this.run('push', options, args);
    }

    public fetch(): Promise<string[]> {
        return this.run('fetch');
    }

    public async diff(options: DiffOptionsI, args: string[]): Promise<string[]> {
        return this.run('diff', options, args);
    }

    public async show(...options: string[]): Promise<string[]> {
        return this.run('show', {}, options);
    }

    public async log(options: {
        all: boolean,
        graph: boolean,
        format: string,
    }): Promise<string[]> {
        return this.run('log', options);
    }

    public async status(options: { short: boolean, 'untracked-files': boolean }): Promise<string[]> {
        return await this.run('status', options, []);
    }

    public async revParse(options: { 'abbrev-ref': boolean, 'symbolic-full-name': string }): Promise<string[]> {
        return this.run('rev-parse', options);
    }

    public async merge(branch: string): Promise<string[]> {
        return this.run('merge', {}, [branch]);
    }

    public async pull(...args: string[]): Promise<string[]> {
        return this.run('pull', {}, args);
    }

    public async reset(path: string): Promise<string[]> {
        return this.run('reset', {}, ['HEAD', path]);
    }

    public async apply(patchOptions: ApplyOptionsI, patch: string[]): Promise<string[]> {
        return this.run('apply', patchOptions, [], patch);
    }

    private optionsToArgs(options: Record<string, boolean | string | undefined>): string[] {
        const args: string[] = [];
        for (const key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                const value: boolean | string | undefined = options[key];

                if (value === false || value === undefined) {
                    continue;
                }

                if (key.length === 1) {
                    if (value === true) {
                        args.push(`-${key}`);
                        continue;
                    }

                    const arg: string = this.escapeArg(value);
                    args.push(`-${key} ${arg}`);
                } else if (key.startsWith('-')) {

                    if (value === true) {
                        args.push(`${key}`);
                        continue;
                    }

                    const arg: string = this.escapeArg(value);
                    args.push(`${key}=${arg}`);
                } else {

                    if (value === true) {
                        args.push(`--${key}`);
                        continue;
                    }

                    const arg: string = this.escapeArg(value);
                    args.push(`--${key}=${arg}`);
                }
            }
        }
        return args;
    }

    private escapeArg(arg: string): string {
        const escapedMessage: string = arg.replace(/"/g, '\\"');
        return `"${escapedMessage}"`;
    }


    private async run(
        gitCmd: string,
        options: Record<string, boolean | undefined | string> = {},
        args: string[] = [],
        stdin?: string[],
    ): Promise<string[]> {
        const optionsArr: string[] = this.optionsToArgs(options);
        return this.spawn([gitCmd, ...optionsArr, ...args], stdin);
    }

    private async spawn(args: string[], stdin?: string[]): Promise<string[]> {
        const lines: string[] = await this.execUtil.spawnSync(this.path, 'git', args, stdin);

        return lines.filter((value) => {
            return value !== "";
        });
    }
}
