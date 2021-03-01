import { Injectable } from "@angular/core";
import { ExecUtil } from "app/lib/Exec/ExecUtil";

import { Repository } from "../lib/Git/Impl/Repository";
import { RepositoryFactory } from "../lib/Git/Impl/RepositoryFactory";

@Injectable({
    providedIn: "root",
})
export class RepositoryService {

    private readonly repositories: { [key: string]: Repository } = {};
    private readonly repositoryFactory: RepositoryFactory;

    public constructor() {
        this.repositoryFactory = new RepositoryFactory(new ExecUtil());
    }

    public getRepository(path: string): Repository {
        if (!this.repositories.hasOwnProperty(path)) {
            this.repositories[path] = this.repositoryFactory.create(path);
        }

        return this.repositories[path];
    }
}
