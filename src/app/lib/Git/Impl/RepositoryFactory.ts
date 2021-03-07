import { ExecUtil } from "../../Exec/ExecUtil";
import { GitRepository } from "./GitRepository";
import { GitExec } from "./GitExec";

export class RepositoryFactory {

    public constructor(
        private readonly execUtil: ExecUtil,
    ) { }

    public create(path: string): GitRepository {
        const repositoryUtility: GitExec = this.createUtility(path);
        return new GitRepository(path, this.execUtil, repositoryUtility);
    }
    public createUtility(path: string): GitExec {
        return new GitExec(path, this.execUtil);
    }
}