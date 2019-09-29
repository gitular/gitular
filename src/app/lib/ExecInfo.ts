export interface ExecInfo {

    command: string;
    error?: Error | null;
    stderr: string | Buffer;
    stdout: string | Buffer;
    success: boolean;
}
