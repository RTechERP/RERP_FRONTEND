import { Component, OnInit, ViewChild, } from '@angular/core';
import { AssetAllocationService } from './AssetAllocationService/AssetAllocation.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import { data } from 'jquery';
import * as XLSX from 'xlsx';
import { ModalService } from '../assets-form/assets-formServices/asset-formservice.service';
import { NgSelectModule } from '@ng-select/ng-select';
(window as any).XLSX = XLSX; 0
import { AssetModalComponent } from '../assets-form/assets-form.component';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-AssetAllocation',
  standalone: true,
  templateUrl: './AssetAllocation.component.html',
  styleUrls: ['./AssetAllocation.component.css'],
  imports: [AssetModalComponent, CommonModule, FormsModule, NgSelectModule]
})
export class AssetAllocationComponent implements OnInit {
  @ViewChild(AssetModalComponent) modalRef!: AssetModalComponent;
  selectedIds: number[] = [];
  DateStart: string = '';
  DateEnd: string = '';
  emplylist: any[] = [];
  assetallocation: any[] = [];
  employeeList: any[] = [];
  dateStart: string = '';
  dateEnd: string = '';
  employeeID: number | null = null;
  status: string = '';
  filterText: string = '';
  pageSize: number = 1000000;
  pageNumber: number = 1;
  table: Tabulator | null = null;
  detailtable: Tabulator | null = null;


  constructor(private assetAllocationService: AssetAllocationService,
    private modalservice: ModalService
  ) { }
  ngOnInit(): void {
    // Khi khởi tạo, tải trang đầu tiên
    this.getAll();
    this.drawDetail();
    if (this.modalRef) {
      this.modalRef.allocationSaved.subscribe(() => {
        this.getAll(); // Refresh table
      });
    }
    this.modalservice.getEmployeetoadd().subscribe((data: any) => {
      this.emplylist = data.data[0];
    });
  }
  getAll(): void {

    this.assetAllocationService.getAssetsManagement(
      this.dateStart || '2012-04-01',
      this.dateEnd || '2025-05-01',
      this.employeeID || 0,  // Sử dụng employeeID đã chọn
      -1,  // Status
      '',
      this.pageSize,
      this.pageNumber
    ).subscribe((data: any) => {
      this.assetallocation = data.data.assetallocation || [];
      this.drawTable();
    });
  }
  getEmployees(): void {
    this.modalservice.getEmployeetoadd().subscribe({
      next: (data: any) => {
        // Gán toàn bộ danh sách nhân viên vào employeeList
        this.employeeList = data.data || [];
        console.log('Danh sách nhân viên:', this.employeeList);
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách nhân viên:', err);
        alert('Không thể tải danh sách nhân viên. Vui lòng thử lại!');
      }
    });
  }
  public drawTable(): void {
    if (this.table) {
      this.table.setData(this.assetallocation)
    }
    else {
      this.table = new Tabulator('#datatableassetallocation', {
        data: this.assetallocation,
        layout: "fitDataStretch",
        pagination: true,
        selectableRows: 5,
        height: '46vh',
        movableColumns: true,
        paginationSize: 20,
        paginationSizeSelector: [5, 10, 20, 50, 100],
        reactiveData: true,
        placeholder: 'Không có dữ liệu',
        dataTree: true,
        addRowPos: "bottom",
        history: true,
        columns: [
          {
            title: 'STT',
            formatter: 'rownum',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 60,
            frozen: true // nếu muốn giữ cột này cố định khi cuộn ngang
          },
          {
            title: '',
            field: '',
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerHozAlign: 'center',
            headerSort: false,
            width: 60, // Tùy chỉnh độ rộng checkbox
            cssClass: 'checkbox-center' // Dùng class tùy chỉnh để căn giữa header
          },
          { title: 'ID', field: 'ID' },
          {
            title: 'Cá Nhân Duyệt',
            field: 'IsApprovedPersonalProperty',
            formatter: function (cell: any) {
              const value = cell.getValue();
              const checked = value === true || value === 'true' || value === 1 || value === '1';
              return `<input type="checkbox" ${checked ? 'checked' : ''} disabled/>`;
            },
            hozAlign: 'center',
            headerHozAlign: 'center',
          },
          {
            title: 'HR Duyệt',
            field: 'Status',
            formatter: function (cell: any) {
              const value = cell.getValue();
              const checked = value === true || value === 'true' || value === 1 || value === '1';
              return `<input type="checkbox" ${checked ? 'checked' : ''} disabled />`;
            },
            hozAlign: 'center',
            headerHozAlign: 'center',
          },
          {
            title: 'KT Duyệt',
            field: 'IsApproveAccountant',
            formatter: function (cell: any) {
              const value = cell.getValue();
              const checked = value === true || value === 'true' || value === 1 || value === '1';
              return `<input type="checkbox" ${checked ? 'checked' : ''}  disabled/>`;
            },
            hozAlign: 'center',
            headerHozAlign: 'center',
          },
          { title: 'Mã', field: 'Code' },
          {
            title: 'Ngày mượn', field: 'DateAllocation', formatter: function (
              cell: any,
              formatterParams: any,
              onRendered: any
            ) {
              let value = cell.getValue() || '';
              return value;
            },
            headerHozAlign: 'center',
          },
          {
            title: 'Người mượn', field: 'EmployeeName',
            headerHozAlign: 'center'
          },
          { title: 'Phòng ban', field: 'Department' },
          { title: 'Vị trí ', field: 'Possition' },
          { title: 'Chú thích', field: 'Note' }
        ],
      });
      this.table.on('rowClick', (evt, row: RowComponent) => {
        const rowData = row.getData();
        const id = rowData['ID'];
        console.log("hgff", id);
        this.assetAllocationService.getAssetAllocationDetail(id).subscribe(res => {
          const details = Array.isArray(res.data.assetsallocationdetail)
            ? res.data.assetsallocationdetail
            : [];
          console.log('Chi tiết allocation:', details);
          this.employeeList = details;
          this.drawDetail();
        });
      });
    }
  }
  exportToExcel() {
    if (this.table) {
      this.table.download('xlsx', 'DanhSachTaiSan.xlsx', { sheetName: 'Tài sản' });
    } else {
      console.warn('Bảng chưa được khởi tạo');
    }
  }
  private drawDetail(): void {
    const cols: ColumnDefinition[] = [
      { title: 'STT', field: 'STT', hozAlign: 'center', width: 60 },
      { title: 'Số lượng', field: 'Quantity', hozAlign: 'center' },
      { title: 'Mã tài sản', field: 'TSCodeNCC' },
      { title: 'Tên tài sản', field: 'TSAssetName' },
      { title: 'Đơn vị', field: 'UnitName', hozAlign: 'center' },
      { title: 'Ghi chú', field: 'Note' }
    ];
    if (this.detailtable) {
      this.detailtable.setData(this.employeeList);
    } else {
      this.detailtable = new Tabulator('#databledetailta', {
        data: this.employeeList,
        layout: "fitDataStretch",
        paginationSize: 5,
        height: '31vh',
        movableColumns: true,
        reactiveData: true,
        columns: cols,
      });
    }
  }
  OpenModalCapphat() {
    if (this.modalRef) {
      this.modalRef.showCapphat(); // Change this from showBaoMat() to showCapphat()
    }
  }
  openEditModal(): void {
    const selectedRows = this.table?.getSelectedData() || [];
    if (selectedRows.length !== 1) {
      alert('Vui lòng chọn đúng một dòng để chỉnh sửa!');
      return;
    }
    const selectedAllocation = selectedRows[0];
    this.assetAllocationService.getAssetAllocationDetail(selectedAllocation.ID).subscribe({
      next: (res) => {
        const allocationDetails = Array.isArray(res.data.assetsallocationdetail)
          ? res.data.assetsallocationdetail
          : [];
        if (this.modalRef) {
          this.modalRef.editAllocation({
            ...selectedAllocation,
            AssetDetails: allocationDetails
          });
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy chi tiết cấp phát:', err);
        alert('Không thể tải chi tiết cấp phát. Vui lòng thử lại!');
      }
    });
  }
  getSelectedIds(): number[] {
    if (this.table) {
      const selectedRows = this.table.getSelectedData();
      return selectedRows.map((row: any) => row.ID);
    }
    return [];
  }

  validateUpdate(action: 'HR_APPROVE' | 'HR_CANCEL' | 'ACCOUNTANT_APPROVE' | 'ACCOUNTANT_CANCEL' | 'Delete'): boolean {
    if (!this.table) {
      Swal.fire('Lỗi', 'Không tìm thấy bảng dữ liệu!', 'error');
      return false;
    }
    const selectedRows = this.table.getSelectedData();

    for (const row of selectedRows) {
      switch (action) {
        case 'HR_APPROVE':
          if (!row.isApprovedPersonalProperty || row.isApproveAccountant == true) {
            Swal.fire('Không thể duyệt', `Tài sản "${row.Code}" chưa được cá nhân duyệt!`, 'warning');
            return false;
          }
          break;

        case 'HR_CANCEL':
          if (row.isApproveAccountant == true) {
            Swal.fire('Không thể hủy', `Tài sản "${row.Code}" đã được kế toán duyệt, không thể hủy!`, 'warning');
            return false;
          }
          break;

        case 'ACCOUNTANT_APPROVE':
          if (row.status !== 1) {
            Swal.fire('Không thể duyệt', `Tài sản "${row.Code}" chưa được HR duyệt!`, 'warning');
            return false;
          }
          break;

        case 'ACCOUNTANT_CANCEL':
          if (row.status !== 1) {
            Swal.fire('Không thể hủy', `Tài sản "${row.Code}" chưa được HR duyệt!`, 'warning');
            return false;
          }
          break;

      }
    }

    return true;
  }
  SaveData(action: 'HR_APPROVE' | 'HR_CANCEL' | 'ACCOUNTANT_APPROVE' | 'ACCOUNTANT_CANCEL' | 'Delete') {
    if (!this.validateUpdate(action)) return;
    const ids = this.getSelectedIds();
    if (ids.length === 0) return alert("Vui lòng chọn ít nhất một dòng!");
    let updatePayload: { id: number, status?: number, isApproveAccountant?: boolean, IsDeleted?: boolean }[] = [];
    switch (action) {
      case 'HR_APPROVE':
        updatePayload = ids.map(id => ({ id, status: 1 }));
        break;
      case 'HR_CANCEL':
        updatePayload = ids.map(id => ({ id, status: 0 }));
        break;
      case 'ACCOUNTANT_APPROVE':
        updatePayload = ids.map(id => ({ id, isApproveAccountant: true }));
        break;
      case 'ACCOUNTANT_CANCEL':
        updatePayload = ids.map(id => ({ id, isApproveAccountant: false }));
        break;
      case 'Delete':
        updatePayload = ids.map(id => ({ id, IsDeleted: true }));
        break;
      default:
        alert('Hành động không hợp lệ');
        return;
    }
    this.assetAllocationService.updateApproval(updatePayload).subscribe({
      next: (res) => {
        if (res.status === 1) {
          alert('Thành công!');
          this.getAll();
        } else {
          alert('Hành động thất bại: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Lỗi kết nối máy chủ.');
      }
    });
  }
  clearAllFilters(): void {
    if (this.table) {
      this.filterText = '';
      this.DateStart = '';
      this.DateEnd = '';
      this.employeeID = null;
      this.status = '';
      this.onFilterChange();
    }
  }
  onSearchChange(): void {
    if (!this.table) return;
    const value = this.filterText.trim();
    if (value) {
      this.table.setFilter([
        { field: 'Code', type: 'like', value }
      ], 'or', { caseSensitive: false });
    } else {
      this.clearAllFilters();
    }
  }
  onFilterChange(): void {
    this.getAll();
  }

}
