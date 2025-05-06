import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgModule } from '@angular/core';
import { EmployeesComponent } from './components/employees/employees.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, EmployeesComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'R_ERP';
    @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef


    addComponent() {
        this.container.clear(); // (nếu muốn xóa trước)
        this.container.createComponent(EmployeesComponent);
    }
}

