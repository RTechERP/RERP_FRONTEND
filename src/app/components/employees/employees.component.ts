import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {  MenuService } from './employee-service/employee.service';
import { ModalService } from '../assetsmanagement/assets-form/assets-formServices/asset-formservice.service';

declare var bootstrap: any;
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

import 'tabulator-tables/dist/css/tabulator.min.css';
@Component({
  selector: 'app-employees',
  imports: [],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
  standalone:true,
  
})
export class EmployeesComponent implements OnInit{
  constructor(private modalservice : ModalService) { }
  employeesID: number[] = [];
  table: Tabulator | null = null; // Declare assets as an array of any type
  ngOnInit(): void {
  }
  getAll(){
    this.modalservice.getEmployee().subscribe((data: any) => {
      this.employeesID = data.data; // Assign the response data to the assets property
      console.log(this.employeesID);
      this.drawTable(); // Log the assets to the console
    });
  }
  private drawTable(): void {
    if (this.table) {
      this.table.setData(this.employeesID);
    } else {
      this.table = new Tabulator('#datatables3', {
        data: this.employeesID,
        layout: 'fitColumns',
        reactiveData: true,
        columns: [
          { title: 'Mã nhân viên', field: 'ID' },
          { title: 'Tên nhân viên', field: 'Name' },
          { title: 'Chức vụ', field: 'Position' },
          { title: 'Phòng ban', field: 'Department' },
        ],
      });
    }
  }
}
