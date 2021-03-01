import { exec } from "child_process";
import { ExecInfo } from "./ExecInfo";
import { EventEmitter } from "@angular/core";
import { Subscription } from "rxjs";

export class ExecUtil {

    private readonly log: EventEmitter<ExecInfo> = new EventEmitter<ExecInfo>();

    public async exec(cwd: string, cmd: string): Promise<string[]> {
        return new Promise((
            resolve: (value: string[]) => void,
            reject: (e: Error) => void
        ) => {
            console.log(cmd);
            exec(cmd, {
                cwd,
            }, (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
                try {
                    const lines: string[] = this.handleExec(cmd, error, stdout, stderr);
                    resolve(lines);
                } catch (e) {
                    reject(error);
                }
            });
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