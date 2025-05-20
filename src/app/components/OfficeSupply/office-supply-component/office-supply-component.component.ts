import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { NgSelectModule } from '@ng-select/ng-select';
import { RowComponent } from 'tabulator-tables';
import { OfficeSupplyUnitServiceService } from '../OSU-service/office-supply-unit-service.service'
@Component({ 
  selector: 'app-office-supply-component',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule,],
  templateUrl: './office-supply-component.component.html',
  styleUrl: './office-supply-component.component.css'
})
export class OfficeSupplyComponentComponent implements OnInit {
  lstOUS: any[] = [];
  table: any; // instance của Tabulator
  dataTable: any[] = [];
  searchText: string = '';
  selectedItem: any = {};
  constructor(private OSU: OfficeSupplyUnitServiceService) { }
  ngOnInit(): void {
    this.drawTable();
    this.get();
  }

  private drawTable(): void {
    if (this.table) {
      this.table.replaceData(this.dataTable);
    } else {
      this.table = new Tabulator('#datatable', {
        height: "70vh",
        pagination: true,
        paginationSize: 20,
        selectableRange: true,
        selectableRangeColumns: true,
        selectableRangeRows: true,
        columnDefaults: {
          headerSort: false,
          resizable: "header"

        },

        columns: [
          {
            title: 'Mã đơn vị',
            field: 'ID',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 150
          },
          {
            title: 'Tên đơn vị',
            field: 'Name',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: "90%"
          }
        ]
      });
      this.table.on("rowClick", (e: MouseEvent, row: RowComponent) => {
        const rowData = row.getData();
        this.getdatabyid(rowData['ID']);
      });
    }
  }
  getdatabyid(id: number) {
    console.log("id", id);
    this.OSU.getdatafill(id).subscribe({
      next: (response) => {
        console.log('Dữ liệu click sửa được:', response);
        let data = null;
        if (response?.data) {
          data = Array.isArray(response.data) ? response.data[0] : response.data;

        } else {
          data = response; // fallback nếu không có response.data
        }

        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          this.selectedItem = { ...data };
        } else {
          console.warn('Không có dữ liệu để fill');
          console.log('Giá trị data:', data);
        }
      }
    });
  }

  onNameChange(value: string) {
    // Nếu người dùng xóa hết và gõ cái gì đó khác ban đầu
    if (!value || value.trim() === '') {
      this.selectedItem = { ID: 0, Name: '' };
    }
  }
  saveSelectedItem() {
    if (!this.selectedItem?.Name) {
      alert("Tên đơn vị không được để trống");
      return;
    }
    this.OSU.updatedata(this.selectedItem).subscribe({
      next: (response) => {
        alert('Lưu thành công');
        this.selectedItem = {}; // responseet form
        this.get(); // Tải lại bảng
      },
      error: (err) => {
        console.error('Lỗi khi lưu dữ liệu:', err);
        alert("Lỗi khi lưu dữ liệu");
      }
    });
  }

  get(): void {
    this.OSU.getdata().subscribe({
      next: (response) => {
        console.log('Dữ liệu nhận được:', response);
        this.lstOUS = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];

        // Cập nhật lại dataTable và reload bảng
        this.dataTable = this.lstOUS;
        if (this.table) {
          this.table.replaceData(this.dataTable);
        } else {
          this.drawTable(); // Lần đầu thì vẽ bảng
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        this.lstOUS = [];
        this.dataTable = [];
        this.drawTable();
      },
    });
  }

}

