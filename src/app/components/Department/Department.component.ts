import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentServiceService } from './DepartmentService.service';
import { Tabulator } from 'tabulator-tables';
@Component({
  selector: 'app-Department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  
  templateUrl: './Department.component.html',
  styleUrls: ['./Department.component.css']
})
export class DepartmentComponent implements OnInit {

  constructor(private department : DepartmentServiceService) { }

  ngOnInit():void {
    this.getDepartment();
  }
  departmentlist: any[] = [];
  table: Tabulator  | null = null; // Declare assets as an array of any type
  getDepartment() { 
    this.department.getDepartment().subscribe((data: any) => {
      this.departmentlist = data.data; // Assign the response data to the assets property
      console.log(this.departmentlist);
      this.drawTable(); // Log the assets to the console
    });
  }
  private drawTable(): void {
    if (this.table) {
      this.table.setData(this.departmentlist);
    } else {
      this.table = new Tabulator('#datatables4', {
        data: this.departmentlist,
        layout: 'fitColumns',

        reactiveData: true,
        columns: [
          { title: 'Mã phòng ban', field: 'ID' },
          { title: 'Tên phòng ban', field: 'Name' },

        ],
      });
    }
  }
  // Các biến để binding input

}
