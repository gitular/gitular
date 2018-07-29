import {Component, OnInit, Input} from '@angular/core';
import {ILog} from '../../lib/ILog';
import {IRepository} from '../../lib/IRepository';
import {RepositoryService} from '../../services/repository.service';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.css'],
})
export class LogsComponent implements OnInit {

    @Input()
    repository: IRepository;
    
    activeLog: ILog | undefined;

    commitInfo: string[] = [];

    constructor(
        private repositoryService: RepositoryService,
    ) {}

    ngOnInit() {
    }

    selectLog(log: ILog) {

        if (log === this.activeLog) {
            this.activeLog = undefined;
            this.commitInfo = [];
            return;
        }
        
        this.activeLog = log;
        this.commitInfo = [];
        this.repositoryService
            .getRepository(this.repository.path)
            .commitInfo(log.commit).subscribe((line: string) => {
                this.commitInfo.push(line);
            });
    }

}
