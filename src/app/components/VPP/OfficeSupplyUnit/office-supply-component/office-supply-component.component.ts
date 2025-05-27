import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { NgSelectModule } from '@ng-select/ng-select';
import { RowComponent } from 'tabulator-tables';
import { OfficeSupplyUnitServiceService } from '../OSU-service/office-supply-unit-service.service'
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
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
  isCheckmode: boolean = false;
  selectedList: any[] = [];
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
        layout: 'fitDataFill',
        height: '75vh',
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,

        columns: [
          {
            title: "",
            formatter: "rowSelection",
            titleFormatter: "rowSelection",
            hozAlign: "center",
            headerHozAlign: "center",
            headerSort: false,
            width: 40,
            frozen: true,

          },
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
          this.selectedItem = {
            ID: data.ID || '',
            Name: data.Name || '',
          };
        } else {
          console.warn('Không có dữ liệu để fill');
          console.log('Giá trị data:', data);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu:', err);
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
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Tên đơn vị không được để trống!',
      })
      return;
    }
    this.OSU.updatedata(this.selectedItem).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Lưu thành công!',
        })
        this.selectedItem = {}; // responseet form
        this.get(); // Tải lại bảng
        this.closeUnitModal();
      },
      error: (err) => {
        console.error('Lỗi khi lưu dữ liệu:', err);
        alert("Lỗi khi lưu dữ liệu");
      }
    });
  }
  deleteUnit() {
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      if (!this.selectedList.some(item => item.ID === row.ID)) {
        this.selectedList.push(row);
      }
    });
    const ids = this.selectedList.map(item => item.ID);
    if (ids.length == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng chọn ít nhất 1 sản phẩm để xóa!',
        showConfirmButton: true,
        timer: 1500
      });
      return;
    }
    else {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Bạn có chắc chắn muốn xóa không?',
        showConfirmButton: true,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.OSU.deletedata(ids).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Đã xóa thành công!',
                showConfirmButton: true,
                timer: 1500
              });
              this.get();
              this.selectedList = [];
            },
            error: (err: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi xóa dữ liệu!',
                showConfirmButton: true,
                timer: 1500
              });
            }
          });
        }
      });
    }
  }


  openUnitModal() {
    const modalEl = document.getElementById('addUnitModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }
  openUnitModalForNewUnit() {
    this.isCheckmode = false;
    this.openUnitModal();
  }
  openUnitModalForUpdateUnit() {
    this.isCheckmode = true;
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      if (!this.selectedList.some(item => item.ID === row.ID)) {
        this.selectedList.push(row);
      }
    });
    const ids = this.selectedList.map(item => item.ID);

    if (this.selectedList.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng chọn 1 đơn vị để sửa!',
        showConfirmButton: true,
        timer: 1500
      });
      this.selectedList = [];
      return;
    } else if (this.selectedList.length > 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng chỉ chọn 1 đơn vị để sửa!',
        showConfirmButton: true,
        timer: 1500
      });
      this.selectedList = [];
      return;
    } else {
      this.getdatabyid(this.selectedList[0].ID);
      this.openUnitModal();
    }
  }
  closeUnitModal() {
    const modalEl = document.getElementById('addUnitModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
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


