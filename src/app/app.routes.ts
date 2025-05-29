import { Routes } from '@angular/router';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectWorkerSyntheticComponent } from './components/projects/project-worker-synthetic/project-worker-synthetic.component';
import { ProjectListWorkReportComponent } from './components/projects/project-list-work-report/project-list-work-report.component';

export const routes: Routes = [
  { path: 'project', component: ProjectsComponent },
  { path: 'projectWorkerSynthetic', component: ProjectWorkerSyntheticComponent },
  { path: 'projectListWorkReport', component: ProjectListWorkReportComponent },
];
