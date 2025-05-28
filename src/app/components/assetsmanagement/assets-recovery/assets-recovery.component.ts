import { Component, OnInit } from '@angular/core';
import { AssetsRecoveryService } from './assets-recovery-service/assets-recovery.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import { data } from 'jquery';
import * as XLSX from 'xlsx';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
(window as any).XLSX = XLSX; 0
import { ModalService } from '../assets-form/assets-formServices/asset-formservice.service';
declare var window: any;
import { NgSelectModule } from '@ng-select/ng-select';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { AssetModalComponent } from '../assets-form/assets-form.component';


@Component({
  selector: 'app-assets-recovery',
  standalone: true,
  templateUrl: './assets-recovery.component.html',
  styleUrls: ['./assets-recovery.component.css'],
  imports: [AssetModalComponent, CommonModule, FormsModule, NgSelectModule]

})
export class AssetsRecoveryComponent implements OnInit {
  @ViewChild('table', { static: false }) tableRef!: ElementRef;
  employeeReturnID: number | null = null;
  employeeRecoveryID: number | null = null;

  dateStart: string = '';
  dateEnd: string = '';
  status: number = -1;
  filterText: string = '';
  pageSize: number = 1000000;
  pageNumber: number = 1;
  assetsrecovery: any[] = [];
  table: Tabulator | null = null;
  detailtable: Tabulator | null = null;
  RecoveryDetail: any[] = [];
  emplylist: any[] = [];
  statusList = [
    { label: 'Chưa duyệt', value: 0 },
    { label: 'Đã duyệt', value: 1 }
  ];
  assetRows: any[] = [];
  assetTable: any;
  RecoveryCode: string = '';
  RecoveryDate: string = '';
  selectedDepartmentReturnName: string = '';
  selectedPositionReturnName: String = '';
  selectedDepartmentRecoveryName: string = '';
  selectedPositionRecoveryName: String = '';

  ngAfterViewInit() {
    this.initTabulator();
    this.generateRecoveryCode();
  }
  constructor(private assetrecoveryservice: AssetsRecoveryService,
    private modalservice: ModalService
  ) { }

  ngOnInit() {
    this.generateRecoveryCode();
    this.getEmployeeID();
    this.getAll();
    this.drawDetail();
  }
  getEmployeeID(): void {
    this.modalservice.getEmployeetoadd().subscribe((data: any) => {
      this.emplylist = data.data[0];
      console.log('Danh sách nhân viên:', this.emplylist);
    });
  }
  //Lay du lieu nhan vien
  onEmployeeSelect(employeeID: number, type: 'return' | 'recovery') {
  const emp = this.emplylist.find(emp => emp.ID === employeeID);
  if (emp) {
    if (type === 'return') {
      this.selectedDepartmentReturnName = emp.DepartmentName || '';
      this.selectedPositionReturnName = emp.PositionName || '';
    } else if (type === 'recovery') {
      this.selectedDepartmentRecoveryName = emp.DepartmentName || '';
      this.selectedPositionRecoveryName = emp.PositionName || '';
    }
  } else {
    if (type === 'return') {
      this.selectedDepartmentReturnName = '';
      this.selectedPositionReturnName = '';
    } else if (type === 'recovery') {
      this.selectedDepartmentRecoveryName = '';
      this.selectedPositionRecoveryName = '';
    }
  }
}
  //Hiển thị bảng
  getAll(): void {
    this.assetrecoveryservice.getAssetsRecovery(
      this.dateStart || '2020-05-22',
      this.dateEnd || '2025-05-22',
      this.employeeReturnID || 0,
      this.employeeRecoveryID || 0,
      this.status,
      this.filterText || '',
      this.pageSize || 1000000,
      this.pageNumber || 1
    ).subscribe((respon: any) => {
      console.log('API response:', respon);
      this.assetsrecovery = respon.data.assetsrecovery || [];

      this.drawtable();
    })
  }
  public drawtable(): void {
    if (this.table) {
      this.table.setData(this.assetsrecovery)
    }
    else {
      this.table = new Tabulator('#datatablerecovery', {
        data: this.assetsrecovery,
        layout: 'fitDataFill',
        locale: 'vi',
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

          {
            title: 'Mã thu hồi',
            field: 'Code',
            hozAlign: 'center',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },

          {
            title: 'Ngày thu hồi',
            field: 'DateRecovery',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },

          {
            title: 'Thu hồi từ',
            field: 'EmployeeReturnName',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },
          {
            title: 'Phòng ban',
            field: 'DepartmentReturn',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },
          {
            title: 'Chức vụ',
            field: 'PossitionReturn',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },

          {
            title: 'Người thu hồi',
            field: 'EmployeeRecoveryName',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },
          {
            title: 'Phòng ban',
            field: 'DepartmentRecovery',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },
          {
            title: 'Chức vụ',
            field: 'PossitionRecovery',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          },
          {
            title: 'Ghi chú',
            field: 'Note',
            headerHozAlign: 'center',
            formatter: function (cell, formatterParams, onRendered) {
              let value = cell.getValue() || '';
              return value;
            },
          }
        ],
      });
      this.table.on('rowClick', (evt, row: RowComponent) => {
        const rowData = row.getData();
        const id = rowData['ID'];
        this.assetrecoveryservice.getAssetsRecoveryDetail(id).subscribe(res => {
          const details = Array.isArray(res.data.assetsrecoverydetail)
            ? res.data.assetsrecoverydetail
            : [];
          this.RecoveryDetail = details;
          this.drawDetail();
        });
      });
    }
  }

  private drawDetail(): void {
    const cols: ColumnDefinition[] = [
      { title: 'STT', field: 'STT', hozAlign: 'center', width: 60 },
      { title: 'Mã tài sản', field: 'TSCodeNCC' },

      { title: 'Tên tài sản', field: 'TSAssetName' },
      { title: 'Số lượng', field: 'Quantity', hozAlign: 'center' },

      { title: 'Đơn vị', field: 'UnitName', hozAlign: 'center' },
      { title: 'Tình trạng', field: 'TinhTrang', hozAlign: 'center' },
      { title: 'Ghi chú', field: 'Note' }



    ];
    if (this.detailtable) {
      this.detailtable.setData(this.RecoveryDetail);
    } else {
      this.detailtable = new Tabulator('#datablerecoverydetail', {
        data: this.RecoveryDetail,
        layout: "fitDataStretch",
        paginationSize: 5,
        height: '31vh',
        movableColumns: true,
        reactiveData: true,

        columns: cols,
      });
    }
  }
  // Tìm kiếm
  clearAllFilters(): void {
    if (this.table) {
      this.filterText = '';
      this.dateStart = '';
      this.dateEnd = '';
      this.employeeReturnID = null;
      this.employeeRecoveryID = null;
      this.employeeRecoveryID;
      this.status = -1;
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
  // Modal thu hồi (thêm, Sửa , Xóa , Excel , Duyệt)
  addRow() {
    if (this.assetTable) {
      this.assetTable.addRow({
        assetCode: '',
        assetName: '',
        quantity: 1,
        note: ''
      });
    }
  }
  initTabulator() {
    this.assetTable = new Tabulator(this.tableRef.nativeElement, {
      height: "300px",
      data: this.assetRows,
      layout: "fitColumns",
      columns: [
        {
          title: "",
          headerClick: () => {
            this.addRow();
          },
          width: 40
        },
        {
          title: "",
          formatter: "rowSelection",
          titleFormatter: "rowSelection",
          hozAlign: "center",
          headerSort: false,
          width: 40
        },
        { title: 'ID', field: 'ID', hozAlign: 'center', width: 100, visible: false },
        { title: "Mã tài sản", field: "assetCode", editor: "input", width: 150 },
        { title: "Tên tài sản", field: "assetName", editor: "input", width: 200 },
        { title: "Số lượng", field: "quantity", editor: "number", width: 100 },
        { title: "Ghi chú", field: "note", editor: "input", width: 434 },
        {
          title: "",
          formatter: "buttonCross",
          width: 40,
          cellClick: (e, cell) => {
            if (confirm('Bạn có chắc muốn xóa dòng này?')) {
              cell.getRow().delete();
            }
          }
        }
      ]
    });
  }
  OpenModalThuHoi() {
    const modal1 = document.getElementById('modalThuHoi');
    if (modal1) {
      const modal = new window.bootstrap.Modal(modal1);
      modal.show();
    }
  }
  generateRecoveryCode(): void {
    if (!this.RecoveryDate) {
      const today = new Date();
      this.RecoveryDate = today.toISOString().split('T')[0]; // "yyyy-MM-dd"
    }
    if (!this.RecoveryDate) return;
    this.assetrecoveryservice.getRecoveryCode(this.RecoveryDate).subscribe({
      next: (res) => {
        this.RecoveryCode = res.data;
        console.log('Mã thu hồi:', this.RecoveryCode);
      },
      error: (err) => {
        console.error('Lỗi khi lấy mã thu hồi:', err);
      }
    });
  }
}
