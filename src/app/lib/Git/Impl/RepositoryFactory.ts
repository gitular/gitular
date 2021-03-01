import { ExecUtil } from "../../Exec/ExecUtil"
import { Repository } from "./Repository"
import { RepositoryUtility } from "./RepositoryUtility"

export class RepositoryFactory {

    public constructor(
        private readonly execUtil: ExecUtil,
    ) { }

    public create(path: string): Repository {
        const repositoryUtility: RepositoryUtility = this.createUtility(path);
        return new Repository(path, this.execUtil, repositoryUtility)
    }
    public createUtility(path: string): RepositoryUtility {
        return new RepositoryUtility(path, this.execUtil);
    }
}