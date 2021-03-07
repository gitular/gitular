import { Injectable } from "@angular/core";
import { ExecUtil } from "../lib/Exec/ExecUtil";
import { GitRepository } from "../lib/Git/Impl/GitRepository";
import { RepositoryFactory } from "../lib/Git/Impl/RepositoryFactory";

@Injectable({
    providedIn: "root",
})
export class RepositoryService {

    private readonly repositories: { [key: string]: GitRepository } = {};
    private readonly repositoryFactory: RepositoryFactory;

    public constructor() {
        this.repositoryFactory = new RepositoryFactory(new ExecUtil());
    }

    public getRepository(path: string): GitRepository {
        // eslint-disable-next-line no-prototype-builtins
        if (!this.repositories.hasOwnProperty(path)) {
            this.repositories[path] = this.repositoryFactory.create(path);
        }

        return this.repositories[path];
    }
}
