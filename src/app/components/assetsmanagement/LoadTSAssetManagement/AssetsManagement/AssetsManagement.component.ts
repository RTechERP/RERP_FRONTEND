import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { AssetsManagementService } from './AssetsManagementService.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentServiceService } from '../../../Department/DepartmentService.service';
import * as XLSX from 'xlsx';
(window as any).XLSX = XLSX;
import { NgSelectModule } from '@ng-select/ng-select';
import { AssetStatusService } from '../../AssetStatus/AssetStatusService/AssetStatus.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { Router } from '@angular/router';
import { AssetModalComponent } from '../../assets-form/assets-form.component';
import { EmployeeService } from '../../assets-form/Assets-formServices/asset-formservice.service';
import { data } from 'jquery';
import Swal from 'sweetalert2';
import { AssetManagementServiceService } from '../../BorrowAssets/AssetManagementHistory/AssetManagementHistoryService/AssetManagementService.service';
@Component({
  selector: 'app-assetsmanagement',
  standalone: true,
  templateUrl: './AssetsManagement.component.html',
  styleUrls: ['./AssetsManagement.component.css'],
  imports: [CommonModule, FormsModule, AssetModalComponent, NgSelectModule],
  providers: [AssetsManagementService]
})
export class AssetsManagementComponent implements OnInit {
  @ViewChild(AssetModalComponent) modalRef!: AssetModalComponent;
  assets: any[] = [];
  selectedStatus = '';
  selectedDepartment = '';
  @Output() onSave = new EventEmitter<any>();
  filterText: string = '';
  DateStart: string = '';
  DateEnd: string = '';
  status: string = '';
  employeeList: any[] = [];
  showSearch = false;
  globalFilter = '';
  modalTitle = 'Thêm tài sản';
  selectedAsset: any = {};
  department: string = '';
  departments: any[] = [];
  statuss: any[] = [];
  employee: any[] = [];
  selectedEmployee: any | null = null;
  employeeTable: Tabulator | null = null;
  constructor(public assetsService: AssetsManagementService,
    private employeeService: EmployeeService,
    public departmentsv: DepartmentServiceService,
    public statussv: AssetStatusService
  ) { }
  ngOnInit(): void {
    this.getAll();
    this.employeeService.getEmployee().subscribe((data: any) => {
      this.employee = data.data;
    });
    this.departmentsv.getDepartment().subscribe((res: any) => {
      this.departments = res.data;
      console.log('Loaded departments:', this.departments);
    });
    this.statussv.getStatus().subscribe((res: any) => {
      this.statuss = res.data;
      console.log('Load status: ', this.statuss);
    });
  }
  Math = Math;
  table: Tabulator | null = null;
  getAll() {
    this.assetsService.getAssetsManagement(
      this.filterText || '',
      1,
      5000,
      this.DateStart || '2023-04-01',
      this.DateEnd || '2025-05-01',
      this.selectedStatus || '1,2,3,4,5,6,7,0',  // <-- truyền vào đây
      this.selectedDepartment || '1,2,3,4,5,6,7'
    ).subscribe((data: any) => {
      this.assets = data.data.assets;
      console.log('fhgf', this.assets);
      this.drawTable();
      this.drawEmployeeTable();
    });
  }
  ngAfterViewInit(): void {
    if (this.modalRef) {
      this.modalRef.saveAsset.subscribe(asset => this.handleSave(asset));
      this.modalRef.saveBaoHongEvent.subscribe(baoHongData => this.handleSaveBaoHong(baoHongData)); // Lắng nghe sự kiện báo hỏng
      this.modalRef.saveBaoMatEvent.subscribe(baomatdata => this.handleSaveBaoMat(baomatdata));

    } else {
      console.warn('ModalRef chưa sẵn sàng trong ngAfterViewInit');
    }
  }
  handleSave(asset: any) {
    this.assetsService.saveAssets(asset).subscribe({
      next: () => {
        Swal.fire({
          title: "Thành công!",
          text: "Lưu thành công!",
          icon: "success"
        });

        this.getAll();
      },
      error: err => {
        console.error('Lỗi khi lưu:', err);
        alert('Lưu thất bại!');
      }
    });
  }
  handleSaveBaoHong(baoHongData: any) {
    console.log('Dữ liệu gửi lên API:', baoHongData);

    this.assetsService.baoHongTaiSan(baoHongData).subscribe({
      next: () => {
         Swal.fire({
          title: "Thành công!",
          text: "Báo hỏng thành công!",
          icon: "success"
        });

      },
      error: (err) => {
        console.error(err);
        alert('Báo hỏng thất bại!');
      }
    });
  }
  handleSaveBaoMat(baomatdata: any) {
    console.log('Dữ liệu gửi lên API:', baomatdata);
    this.assetsService.baoMatTaiSan(baomatdata).subscribe({
      next: () => {
           Swal.fire({
          title: "Thành công!",
          text: "Báo mất thành công!",
          icon: "success"
        });

      },
      error: (err) => {
        console.error(err);
        alert('Báo mất thất bại');
      }
    });
  }
  exportToExcel() {
    if (this.table) {
      this.table.download('xlsx', 'DanhSachTaiSan.xlsx', { sheetName: 'Tài sản' });
    } else {
      console.warn('Bảng chưa được khởi tạo');
    }
  }

  public drawTable(): void {
    if (this.table) {
      this.table.setData(this.assets);
    } else {
      this.table = new Tabulator('#datatablemanagement1', {
        data: this.assets,
        layout: "fitDataFill",
        pagination: true,
        selectableRows: 1,
        height: '50vh',
        movableColumns: true,
        paginationSize: 15,
        paginationSizeSelector: [5, 10, 20, 50, 100],
        reactiveData: true,
        placeholder: 'Không có dữ liệu',
        dataTree: true,
        addRowPos: "bottom",          //when adding a new row, add it to the top of the table
        history: true,
        columns: [
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
          { title: 'STT', field: 'STT', hozAlign: 'center', width: 70, headerFilter: true },
          { title: 'ID', field: 'ID', hozAlign: 'center', width: 70, visible: false },
          { title: 'Mã tài sản', field: 'TSAssetCode', headerFilter: true },
          { title: 'Tên tài sản', field: 'TSAssetName', headerFilter: true },
          { title: 'Seri', field: 'Seri', headerFilter: true },
          {
            title: 'Đơn vị', field: 'UnitName', headerFilter: true, formatter: function (
              cell: any,
              formatterParams: any,
              onRendered: any
            ) {
              let value = cell.getValue() || '';
              return value;
            },
            headerHozAlign: 'center',

          },
          { title: 'Thông số', field: 'SpecificationsAsset', headerFilter: true },
          { title: 'Ngày mua', field: 'DateBuy', headerFilter: true },
          { title: 'Ngày hiệu lực', field: 'DateEffect', formatter: 'datetime', formatterParams: { inputFormat: 'yyyy-MM-ddTHH:mm:ss', outputFormat: 'dd/MM/yyyy' }, headerFilter: true },
          { title: 'Bảo hành (tháng)', field: 'Insurance', headerFilter: true },
          {
            title: 'Loại tài sản', field: 'AssetType', headerFilter: true, formatter: function (
              cell: any,
              formatterParams: any,
              onRendered: any
            ) {
              let value = cell.getValue() || '';
              return value;
            },
            headerHozAlign: 'center',
          },
          { title: 'Phòng ban', field: 'Name', headerFilter: true },
          {
            title: 'Trạng thái', field: 'Status', formatter: (cell: CellComponent) => {
              const val = cell.getValue() as string;
              const el = cell.getElement();
              el.style.backgroundColor = '';
              el.style.color = '';
              if (val === 'Chưa sử dụng') {
                el.style.backgroundColor = '#00CC00';
                el.style.outline = '1px solid #e0e0e0';
                el.style.color = '#fff';
              } else if (val === 'Đang sử dụng') {
                el.style.backgroundColor = '#FFCC00';
                el.style.color = '#000000';
                el.style.outline = '1px solid #e0e0e0';
              }
              else if (val === 'Đã thu hồi') {
                el.style.backgroundColor = '#FFCCCC';
                el.style.color = '#000000';
                el.style.outline = '1px solid #e0e0e0';
              }
              else if (val === 'Mất') {
                el.style.backgroundColor = '#BB0000';
                el.style.color = '#000000';
                el.style.outline = '1px solid #e0e0e0';
              }
              else if (val === 'Hỏng') {
                el.style.backgroundColor = '#FFCCCC';
                el.style.color = '#000000';
                el.style.outline = '1px solid #e0e0e0';
              }
              else {
                el.style.backgroundColor = '#e0e0e0';
              }
              return val; // vẫn hiển thị chữ
            }
            , headerFilter: true
          },
          { title: 'Mã NCC', field: 'TSCodeNCC', headerFilter: true },
          {
            title: 'Nguồn gốc', field: 'SourceName', headerFilter: true, formatter: function (
              cell: any,
              formatterParams: any,
              onRendered: any
            ) {
              let value = cell.getValue() || '';
              return value;
            },
            headerHozAlign: 'center'
          },
          { title: 'Người quản lý', field: 'FullName', headerFilter: true },
          { title: 'Người tạo', field: 'CreatedBy', headerFilter: true },
          { title: 'Ngày tạo', field: 'CreatedDate', headerFilter: true },
          { title: 'Người cập nhật', field: 'UpdatedBy', headerFilter: true },
          { title: 'Ngày cập nhật', field: 'UpdatedDate', headerFilter: true },
          {
            title: 'Is Allocation',
            field: 'IsAllocation',
            formatter: (cell: CellComponent) => cell.getValue() ? 'Có' : 'Không', headerFilter: true
          },
          { title: 'Office Active', field: 'OfficeActiveStatus', headerFilter: true },
          { title: 'Windows Active', field: 'WindowActiveStatus', headerFilter: true },
          { title: 'Mô tả chi tiết', field: 'SpecificationsAsset', headerFilter: true },
          { title: 'Ghi chú', field: 'Note', headerFilter: true }

        ] as any[],
      });
      this.table.on('rowClick', (evt, row: RowComponent) => {
        const rowData = row.getData();
        const employeeId = rowData['ID'];
        this.employeeService.getEmployeeById(employeeId).subscribe(res => {
          this.employeeList = Array.isArray(res.data.assetsallocation) ? res.data.assetsallocation : [res.data];
          this.drawEmployeeTable();
        });
      });

    }
  }
    
  private drawEmployeeTable(): void {
    const cols: ColumnDefinition[] = [
      {
        title: 'Trạng thái',
        field: 'Status',
        formatter: (cell) => {
          const val = cell.getValue() as string;
          const el = cell.getElement();
          el.style.backgroundColor = '';
          el.style.color = '';
          if (val === 'Chưa sử dụng') {
            el.style.backgroundColor = '#33CC99';
            el.style.color = '#fff';
            el.style.outline = '#000000';
          } else if (val === 'Đang sử dụng') {
            el.style.backgroundColor = '#FFCC00';
            el.style.color = '#000000';
            el.style.outline = '#000000';
          }
          else if (val === 'Đã thu hồi') {
            el.style.backgroundColor = '#FFCCCC';
            el.style.color = '#000000';
            el.style.outline = '#000000';
          }
          else {
            el.style.backgroundColor = '#e0e0e0';
          }
          return val;
        }
      },
      { title: 'Mã NV', field: 'Code' },
      { title: 'Họ và tên', field: 'FullName' },
      { title: 'Phòng ban', field: 'dpmName' },
      { title: 'Chức vụ', field: 'CVName' },
      { title: 'Ghi chú', field: 'Note' },
      { title: 'Ngày cập nhật', field: 'UpdatedDate' },
      { title: 'Ngày tạo', field: 'CreatedDate' }
    ];
    if (this.employeeTable) {
      this.employeeTable.setData(this.employeeList);
    } else {
      this.employeeTable = new Tabulator('#datatable-employee', {
        data: this.employeeList,
        layout: "fitDataStretch",
        paginationSize: 5,
        movableColumns: true,
        reactiveData: true,
        columns: cols,
      });
    }
  }

  openBaoHongModal() {
    if (!this.table) {
      alert('Vui lòng tải lại trang!');
      return;
    }

    const selectedRows = this.table.getSelectedRows();
    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một tài sản để báo hỏng!');
      return;
    }

    const asset = selectedRows[0].getData();
    this.selectedAsset = { ...asset }; // Sao chép dữ liệu tài sản được chọn
    this.modalTitle = 'Báo hỏng tài sản';

    // Gọi hàm showBaoHong từ AssetModalComponent
    if (this.modalRef) {
      this.modalRef.selectedAsset = this.selectedAsset;
      this.modalRef.showBaoHong();
    }
  }
  openBaoMatModal() {
    if (!this.table) {
      alert('Vui lòng tải lại trang');
      return;
    }
    const selectedRows = this.table.getSelectedRows();
    if (selectedRows.length == 0) {
      alert('Vui lòng chọn tài sản báo mất');
      return;
    }
    const asset = selectedRows[0].getData();
    this.selectedAsset = { ...asset };
    if (this.modalRef) {
      this.modalRef.selectedAsset = this.selectedAsset;
      this.modalRef.showBaoMat();
    }
  }

  openModal(action: 'add' | 'edit', asset?: any) {
    if (action === 'add') {
      this.modalTitle = 'Thêm tài sản';
      this.selectedAsset = {};
    } else if (action === 'edit' && asset) {
      this.employeeService.getDepartment().subscribe((data: any) => {
        this.department = data.data;
      });
      this.modalTitle = 'Cập nhật tài sản ';
      this.selectedAsset = { ...asset };
    }
    if (this.modalRef) {
      this.modalRef.selectedAsset = this.selectedAsset;
      this.modalRef.show();
    }
  }
  onEditClick() {
    if (!this.table) {
      alert('Vui lòng tải lại trang!');
      return;
    }
    const selectedRows = this.table.getSelectedRows();
    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một hàng để sửa!');
      return;
    }
    const asset = selectedRows[0].getData();
    this.openModal('edit', asset);
  }
    getSelectedIds(): number[] {
  if (this.table) {
    const selectedRows = this.table.getSelectedData();
    return selectedRows.map((row: any) => row.ID);
  }
  return [];
}
  onDeleteClick() {
    if (!this.table) {
      alert('Vui lòng tải lại trang!');
      return;
    }
     const ids = this.getSelectedIds();
    if (ids.length === 0) {
      alert('Vui lòng chọn ít nhất một hàng để xóa!');
      return;
    }
 
   this.assetsService.DeleteAssetManagement(ids).subscribe({
    next: res => {
   Swal.fire({
  icon: 'success',
  title: 'Thành công!',
  text: 'Dữ liệu đã được lưu.',
  timer: 2000,
  showConfirmButton: false
});

      this.getAll(); // Reload lại table
    },
    error: err => alert('Lỗi duyệt HR: ' + err.message)
  });
    
  }
  clearAllFilters(): void {
    if (this.table) {
      this.searchText = '';
      this.DateStart = '';
      this.DateEnd = '';
      this.selectedDepartment = '';
      this.department = '';
      this.onFilterChange();
    }
  }
  searchText: string = '';
  onSearchChange(): void {
    if (!this.table) return;
    const value = this.searchText.trim();
    if (value) {
      this.table.setFilter([
        { field: 'TSAssetName', type: 'like', value }

      ], 'or', { caseSensitive: false });
    } else {
      // Khi clear text hoặc đóng collapse
      this.clearAllFilters();
    }
  }
  onFilterChange(): void {
    this.getAll();
  }
}


