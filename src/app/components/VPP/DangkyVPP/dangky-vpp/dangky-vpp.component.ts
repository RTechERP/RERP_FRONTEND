import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet
import { flatMap } from 'rxjs';
import { DangkyvppServiceService } from '../dangkyvpp-service/dangkyvpp-service.service'
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { RowComponent } from 'tabulator-tables';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

declare var bootstrap: any;

interface Unit {
  Code: string;
  Name: string;
}

interface Product {
  SupplyUnitID: number;
  Price: number;
  Type: number;
  RequestLimit: number;
  // thêm các trường khác nếu cần
}

@Component({
  selector: 'app-dangky-vpp',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, SweetAlert2Module],
  templateUrl: './dangky-vpp.component.html',
  styleUrl: './dangky-vpp.component.css'
})

export class DangkyVppComponent implements OnInit {
  table: any;
  table2: any;
  dataTable1: any[] = [];
  dataTable2: any[] = [];
  dataDeparment: any[] = [];
  listDKVPP: any[] = [];
  listUnit: any[] = [];
  isLoading: boolean = false;
  selectedList: any[] = [];
  // Add new properties
  newUnit: Unit = {
    Code: '',
    Name: ''
  };

  typeOptions = [
    { id: 2, name: 'Dùng chung' },
    { id: 1, name: 'Cá nhân' }
  ];

  newProduct: Product = {
    SupplyUnitID: 0,
    Price: 0,
    Type: 2, // default to Dùng chung
    RequestLimit: 0
  };

  // Add new search parameters
  searchParams = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departmentId: 0,
    keyword: ''
  };

  constructor(private lstDKVPP: DangkyvppServiceService) { }
  ngOnInit(): void {
    this.drawTable();
    this.getdataDeparment();
    this.getdataDKVPP();
  }

  getdataDeparment(): void {
    this.lstDKVPP.getdataDepartment().subscribe({
      next: (res) => {
        console.log('Danh sách phòng ban:', res);
        if (res && Array.isArray(res.data)) {
          this.dataDeparment = res.data;

        } else {
          this.dataDeparment = [];
          console.warn("Phản hồi không chứa danh sách");
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn vị tính:', err);
      }
    });
  }

  getdataDKVPP(): void {
    this.isLoading = true;
    const searchDate = new Date(this.searchParams.year, this.searchParams.month);

    this.lstDKVPP.spGetOfficeSupplyRequests(
      this.searchParams.keyword,
      searchDate,
      0,
      this.searchParams.departmentId
    ).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.data)) {
          this.listDKVPP = res.data;
          console.log('Dữ liệu tìm kiếm:', this.listDKVPP);
          // Cập nhật lại dataTable và reload bảng
          this.dataTable1 = this.listDKVPP;
          if (this.table) {
            this.table.replaceData(this.dataTable1);
          }
        } else {
          this.listDKVPP = [];
          this.dataTable1 = [];
          if (this.table) {
            this.table.replaceData([]);
          }
          console.warn("Không tìm thấy dữ liệu phù hợp");
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu:', err);
        this.dataTable1 = [];
        if (this.table) {
          this.table.replaceData([]);
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Add new methods to handle input changes
  onYearChange(event: any): void {
    this.searchParams.year = parseInt(event.target.value);
    this.getdataDKVPP();
  }

  onMonthChange(event: any): void {
    this.searchParams.month = parseInt(event.target.value);
    this.getdataDKVPP();
  }

  onDepartmentChange(event: any): void {
    console.log('Selected department:', event);
    // Kiểm tra nếu event là object và có ID
    if (event && typeof event === 'object' && 'ID' in event) {
      this.searchParams.departmentId = event.ID;
    } else {
      this.searchParams.departmentId = 0;
    }
    console.log('Department ID:', this.searchParams.departmentId);
    this.getdataDKVPP();
  }

  // Thêm debounce cho tìm kiếm theo keyword
  private searchTimeout: any;
  onKeywordChange(event: any): void {
    this.searchParams.keyword = event.target.value;
    // Clear timeout cũ nếu có
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // Đặt timeout mới
    this.searchTimeout = setTimeout(() => {
      this.getdataDKVPP();
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ
  }

  private drawTable(): void {
    if (this.table) {
      this.table.replaceData(this.dataTable1);
    } else {
      this.table = new Tabulator('#datatable1', {
        data: this.dataTable1,
        layout: 'fitDataFill',
        height: '20vh',
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        rowHeader: {
          headerSort: false,
          resizable: false,
          frozen: true,
          formatter: "rowSelection", // Đây là cấu hình để Tabulator tự tạo checkbox
          headerHozAlign: "center",
          hozAlign: "center",
          titleFormatter: "rowSelection", // Đây cũng là để thêm checkbox cho header
          cellClick: (e, cell) => {
            e.stopPropagation(); // Ngăn sự kiện click hàng khi bấm vào checkbox
            const checkbox = e.target as HTMLInputElement;
          },
        },
        columns: [
          {
            title: 'Admin duyệt',
            field: 'IsAdminApproved',
            hozAlign: 'center',
            headerHozAlign: 'center',
            formatter: (cell) => {
              const value = cell.getValue();
              return `<input type="checkbox" ${value === true ? 'checked' : ''} disabled />`;
            },

          },
          {
            title: 'TBP duyệt',
            field: 'IsApproved',
            hozAlign: 'center',
            headerHozAlign: 'center',
            formatter: (cell) => {
              const value = cell.getValue();
              return `<input type="checkbox" ${value === true ? 'checked' : ''} disabled />`;
            },

          },

          {
            title: 'Ngày TBP duyệt', field: 'DateApproved', hozAlign: 'center', headerHozAlign: 'center', formatter: (cell) => {
              const value = cell.getValue();
              if (value && typeof value === 'object') return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          },
          { title: 'Họ tên TBP duyệt', field: 'FullNameApproved', hozAlign: 'left', headerHozAlign: 'center', width: 200 },
          { title: 'Người đăng ký', field: 'UserName', hozAlign: 'left', headerHozAlign: 'center', width: 150 },
          { title: 'Phòng ban', field: 'DepartmentName', hozAlign: 'left', headerHozAlign: 'center', width: 160 },
          {
            title: 'Ngày đăng ký',
            field: 'DateRequest',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 200,
            formatter: (cell) => {
              const value = cell.getValue();
              if (!value) return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          }
        ]
      });
    }
    if (this.table2) {
      this.table2.replaceData(this.dataTable2);
    } else {
      this.table2 = new Tabulator('#datatable2', {
        data: this.dataTable2,
        layout: 'fitDataFill',
        height: '20vh',
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        rowHeader: {
          headerSort: false,
          resizable: false,
          frozen: true,
          formatter: "rowSelection", // Đây là cấu hình để Tabulator tự tạo checkbox
          headerHozAlign: "center",
          hozAlign: "center",
          titleFormatter: "rowSelection", // Đây cũng là để thêm checkbox cho header
          cellClick: (e, cell) => {
            e.stopPropagation(); // Ngăn sự kiện click hàng khi bấm vào checkbox
            const checkbox = e.target as HTMLInputElement;
          },
        },
        columns: [
          {
            title: 'Văn phòng phẩm',
            field: 'OfficeSupplyName',
            hozAlign: 'left',
            headerHozAlign: 'center',
            width: 440,
            formatter: function (cell) {
              const value = cell.getValue();
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') {
                // Nếu là object, trả về thuộc tính Name hoặc thuộc tính phù hợp
                return value.Name || value.name || '';
              }
              return value;
            }
          },
          { title: 'ĐVT', field: 'Unit', hozAlign: 'center', headerHozAlign: 'center' },
          { title: 'SL đề xuất', field: 'Quantity', hozAlign: 'right', headerHozAlign: 'center' },
          { title: 'SL thực tế', field: 'QuantityReceived', hozAlign: 'right', headerHozAlign: 'center' },
          { title: 'Vượt định mức', field: 'ExceedLimit', hozAlign: 'center', headerHozAlign: 'center' },
          { title: 'Lý do vượt định mức', field: 'ReasonExceedLimit', hozAlign: 'left', headerHozAlign: 'center', width: 200 },
          { title: 'Ghi chú', field: 'Note', hozAlign: 'left', headerHozAlign: 'center' },
        ]
      });
      this.table.on("rowClick", (e: MouseEvent, row: RowComponent) => {
        const rowData = row.getData();
        console.log("id:", rowData['ID']);
        this.getdataOfficeSupplyRequestsDetail(rowData['ID']);

      });
    }
  }

  getdataOfficeSupplyRequestsDetail(id: number): void {
    this.lstDKVPP.spGetOfficeSupplyRequestsDetail(id).subscribe({
      next: (res) => {
        this.dataTable2 = res.data;
        this.drawTable();
      }
    }
    )
  }

  // Add new method for adding unit
  addNewUnit(): void {
    if (!this.newUnit.Code || !this.newUnit.Name) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    this.lstDKVPP.addUnit(this.newUnit).subscribe({
      next: (response: any) => {
        alert('Thêm đơn vị tính thành công!');
        const modalEl = document.getElementById('addUnitModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }
        this.newUnit = {
          Code: '',
          Name: ''
        };
        this.getdataDeparment();
      },
      error: (error: any) => {
        console.error('Lỗi khi thêm đơn vị tính:', error);
        alert('Có lỗi xảy ra khi thêm đơn vị tính!');
      }
    });
  }
  PushSelectedList(): boolean {
    this.selectedList = [];
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      this.selectedList.push(row);

    });
    if (this.selectedList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng chọn ít nhất 1 người đăng ký để duyệt/hủy duyệt!',
      });
      return false;
    }
    return true;
  }
  IsAdminApproved(): void {
    if (!this.PushSelectedList()) {
      return;
    } else {
      const ids = this.selectedList.map(item => item.ID);
      Swal.fire({
        title: 'Bạn có chắc chắn muốn duyệt các VPP đã chọn không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy bỏ'
      }).then((result) => {
        if (result.isConfirmed) {
          this.lstDKVPP.IsAdminApproved(ids).subscribe({
            next: (res) => {
              this.getdataDKVPP();
              this.selectedList = [];
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Duyệt thành công!',
                showConfirmButton: true,
                timer: 1500
              });
            },
            error: (error: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi duyệt!',
              });
            }
          });
        }
      })
    }
  }
  UnAdminApproved(): void {
    if (!this.PushSelectedList()) {
      return;
    } else {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn hủy duyệt các VPP đã chọn không này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy bỏ'
      }).then((result) => {
        if (result.isConfirmed) {
          const ids = this.selectedList.map(item => item.ID);
          this.lstDKVPP.UnAdminApproved(ids).subscribe({
            next: (res) => {
              this.getdataDKVPP();
              this.selectedList = [];
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Hủy duyệt thành công!',
                showConfirmButton: true,
                timer: 1500
              });
            },
            error: (error: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi hủy duyệt!',
              });
            }
          });
        }
      })
    }
  }
  IsApproved(): void {
    if (!this.PushSelectedList()) {
      return;
    } else {
      const ids = this.selectedList.map(item => item.ID);
      Swal.fire({
        title: 'Bạn có chắc chắn muốn duyệt các VPP đã chọn không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy bỏ'
      }).then((result) => {
        if (result.isConfirmed) {
          this.lstDKVPP.IsApproved(ids).subscribe({
            next: (res) => {
              this.getdataDKVPP();
              this.selectedList = [];
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Duyệt thành công!',
                showConfirmButton: true,
                timer: 1500
              });
            },
            error: (error: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi duyệt!',
              });
            }
          });
        }
      })
    }
  }
  UnIsApproved(): void {
    if (!this.PushSelectedList()) {
      return;
    } else {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn hủy duyệt các VPP đã chọn không này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy bỏ'
      }).then((result) => {
        if (result.isConfirmed) {
          debugger;
          const ids = this.selectedList.map(item => item.ID);
          this.lstDKVPP.UnIsApproved(ids).subscribe({
            next: (res) => {
              this.getdataDKVPP();
              this.selectedList = [];
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Hủy duyệt thành công!',
                showConfirmButton: true,
                timer: 1500
              });
            },
            error: (error: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi hủy duyệt!',
              });
            }
          });
        }
      })
    }
  }
}

