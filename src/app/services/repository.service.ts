import {Injectable} from '@angular/core';
import {Repository} from '../lib/Repository';

@Injectable({
    providedIn: 'root'
})
export class RepositoryService {

    private repositories: {[key: string]: Repository} = {};

    public getRepository(path: string): Repository {
        if (!this.repositories.hasOwnProperty(path)) {
            this.repositories[path] = new Repository(path)
        }

        return this.repositories[path];
    }
}