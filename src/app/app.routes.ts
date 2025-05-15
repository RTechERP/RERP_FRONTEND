import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { POKHComponent } from './components/pokh/pokh.component';
import { ListPokhComponent } from './components/pokh/list-pokh/list-pokh.component';
export const routes: Routes = [
    {
        path: 'employees',
        component: EmployeesComponent,
    },
    {
        path: "pokh",
        component: ListPokhComponent,
    }
];
