export interface IBranch {
    active: boolean;
    ahead?: number;
    behind?: number;
    message: string;
    name: string;
    shortRevision: string;
    trackingBranch?: string;
}
