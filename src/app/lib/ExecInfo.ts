export interface ExecInfo {
    
    command: string;
    success: boolean;
    stdout: string;
    stderr: string;
    error: Error;
}