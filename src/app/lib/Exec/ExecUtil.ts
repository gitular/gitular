import { ChildProcess, exec, spawn } from "child_process";
import { ExecInfo } from "./ExecInfo";
import { EventEmitter } from "@angular/core";
import { Subscription } from "rxjs";
import { Writable } from "stream";

export class ExecUtil {

    private readonly log: EventEmitter<ExecInfo> = new EventEmitter<ExecInfo>();

    public async spawn(
        cwd: string,
        cmd: string,
        args: string[] = [],
        stdin: string[] = []
    ): Promise<string[]> {
        console.log(cwd, cmd, args, stdin);
        return new Promise((
            resolve: (val: string[]) => void,
            reject: (val: unknown) => void
        ) => {
            const process: ChildProcess = spawn(cmd, args, {
                cwd: cwd,
            });

            const lines: string[] = [];
            process.stdout.on('data', (data: Buffer) => {
                lines.push(data.toString('utf-8'));
            });

            process.stdout.on('end', () => {
                console.log('stdout Finished');
            });
            process.stderr.on('end', () => {
                console.log('stderr Finished');
            });

            process.stderr.on('data', (data) => {
                console.error(`child stderr:\n${data}`);
            });

            process.on('error', (err: Error) => {
                reject(err);
            });

            process.on('exit', (code) => {
                if (code != 0) {
                    reject(new Error("Program ended with a error code : " + code));
                } else {
                    resolve(lines);
                }
            });

            if (stdin !== undefined) {
                process.stdin.write(stdin.join("\n"), 'utf8');
            }
            process.stdin.end();
            process.stdin.destroy();

        });
    }

    public async exec(cwd: string, cmd: string, pipe?: string): Promise<string[]> {
        return new Promise((
            resolve: (value: string[]) => void,
            reject: (e: Error) => void
        ) => {
            console.log(cmd);
            const process: ChildProcess = exec(cmd, {
                cwd,
            }, (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
                try {
                    const lines: string[] = this.handleExec(cmd, error, stdout, stderr);
                    resolve(lines);
                } catch (e) {
                    reject(error);
                }
            });
            if (pipe) {
                console.log('Piping')
                process.stdin.write(pipe);
            }

        });

    }

    public subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription {
        return this.log.subscribe(generatorOrNext, error, complete);
    }

    private handleExec(cmd: string, error: Error, stdout: string | Buffer, stderr: string | Buffer) {
        const toLog: ExecInfo = {
            command: cmd,
            success: !error,
            stdout,
            stderr,
            error,
        };
        this.log.emit(toLog);

        if (error) {
            throw error;
        }

        return stdout
            .toString()
            .split("\n");
    }
}