import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { POKHComponent } from './components/pokh/pokh.component';
import { ListPokhComponent } from './components/pokh/list-pokh/list-pokh.component';
import {ImportExcelComponent} from '../app/components/pokh/import-excel/import-excel.component'
export const routes: Routes = [
    {
        path: 'employees',
        component: EmployeesComponent,
    },
    {
        path: "pokh",
        component: ListPokhComponent,
    },
    {
        path: "excel",
        component: ImportExcelComponent
    }
];
