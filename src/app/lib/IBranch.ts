export interface IBranch {
    active: boolean;
    name: string;
    shortRevision;
    trackingBranch?: string;
    ahead?: number;
    behind?: number;
    message: string;
}
