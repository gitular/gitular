import {  exec, spawnSync, SpawnSyncReturns } from "child_process";
import { ExecInfo } from "./ExecInfo";
import { Subscription } from "rxjs";

export class ExecUtil {

    // eslint-disable-next-line @typescript-eslint/require-await
    public async spawnSync(
        cwd: string,
        cmd: string,
        args: string[] = [],
        stdin: string[] = []
    ): Promise<string[]> {

        try {
            const response: SpawnSyncReturns<Buffer> = spawnSync(cmd, args, {
                cwd: cwd,
                shell: true,
            });

            const result: (Uint8Array | null)[] = response.output as unknown as (Uint8Array | null)[];

            const lines: string[] = result.map((value: Uint8Array | null) => {
                if (value === null) {
                    return '';
                }
                const buf: Buffer = Buffer.from(value.buffer);

                return buf.toString('utf8');
            }).join('').split("\n");
            console.log({ cwd, cmd, args, stdin, result, lines, response });
            return lines;

        } catch (e) {
            console.error({ cwd, cmd, args, stdin, e });
            throw e;
        }
    }
}