import { FileStatus } from "./FileStatus";

export interface IStatus {
    /**
     * The index, or staging area, is where commits are prepared.
     */
    index: FileStatus;
    indexed: boolean;

    local: boolean;
    /**
     * For renames/copies.
     */
    origPath?: string;
    path: string;
    /**
     * The working tree, or working directory, consists of files that you are currently working on.
     */
    working: FileStatus;
}
