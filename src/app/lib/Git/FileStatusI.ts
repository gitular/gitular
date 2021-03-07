export enum FileStatusI {
    UNMODIFIED = " ",
    MODIFIED = "M",
    ADDED = "A",
    DELETED = "D",
    RENAMED = "R",
    COPIED = "C",
    UPDATED = "U",
    UNTRACKED = "?",
    IGNORED = "!",
}
export const fileStatusFromString = (str: string): FileStatusI => {
    switch (str) {
        case FileStatusI.UNMODIFIED:
            return FileStatusI.UNMODIFIED;
        case FileStatusI.MODIFIED:
            return FileStatusI.MODIFIED;
        case FileStatusI.ADDED:
            return FileStatusI.ADDED;
        case FileStatusI.DELETED:
            return FileStatusI.DELETED;
        case FileStatusI.RENAMED:
            return FileStatusI.RENAMED;
        case FileStatusI.COPIED:
            return FileStatusI.COPIED;
        case FileStatusI.UPDATED:
            return FileStatusI.UPDATED;
        case FileStatusI.UNTRACKED:
            return FileStatusI.UNTRACKED;
        case FileStatusI.IGNORED:
            return FileStatusI.IGNORED;

        default:
            throw new Error(`Unknown status '${str}'`);
    }
};