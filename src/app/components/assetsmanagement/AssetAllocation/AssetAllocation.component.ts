import { Component, OnInit, ViewChild, } from '@angular/core';
import { AssetAllocationService } from './AssetAllocationService/AssetAllocation.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import { data } from 'jquery';
import { AssetModalComponent } from '../assets-form/assets-form.component';
import { NgModule } from '@angular/core';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-AssetAllocation',
  standalone: true,
  templateUrl: './AssetAllocation.component.html',
  styleUrls: ['./AssetAllocation.component.css'],
  imports: [AssetModalComponent, CommonModule]
})
export class AssetAllocationComponent implements OnInit {
  @ViewChild(AssetModalComponent) modalRef!: AssetModalComponent;

  assetallocation: any[] = [];
  employeeList: any[] = [];
  // Các tham số lọc / phân trang
  dateStart: string = '';       // ví dụ: '2025-05-01'
  dateEnd: string = '';         // ví dụ: '2025-05-14'
  employeeID: string = '0';      // chuỗi rỗng nghĩa là không lọc
  status: string = '';          // chuỗi rỗng nghĩa là không lọc
  filterText: string = '';      // chuỗi rỗng nghĩa là không lọc
  pageSize: number = 1000000;
  pageNumber: number = 1;
  table: Tabulator | null = null;
  detailtable: Tabulator | null = null;
  constructor(private assetAllocationService: AssetAllocationService) { }
  ngOnInit(): void {
    // Khi khởi tạo, tải trang đầu tiên
    this.getAll();
    this.drawDetail();

  }
  getAll(): void {
    this.assetAllocationService.getAssetsManagement(
      this.dateStart || '2020-04-01',
      this.dateEnd || '2025-05-01',
      0,  // EmployeeID
      1,  // Status
      this.filterText,
      this.pageSize,
      this.pageNumber
    ).subscribe((data: any) => {
      this.assetallocation = data.data.assetallocation;
      console.log(this.assetallocation);
      this.drawTable();
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
        selectableRows: 1,
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
          { title: 'ID', field: 'ID', visible: false },
        {
  title: 'Cá Nhân Duyệt',
  field: 'IsApprovedPersonalProperty',
  formatter: function (cell: any) {
    const value = cell.getValue();
    const checked = value === true || value === 'true' || value === 1 || value === '1';
    return `<input type="checkbox" ${checked ? 'checked' : ''} />`;
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
    return `<input type="checkbox" ${checked ? 'checked' : ''}  />`;
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
    return `<input type="checkbox" ${checked ? 'checked' : ''}  />`;
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
            title: 'Người mượn', field: 'EmployeeName', formatter: function (
              cell: any,
              formatterParams: any,
              onRendered: any
            ) {
              let value = cell.getValue() || '';
              return value;
            },
            headerHozAlign: 'center'
          },
          { title: 'Phòng ban', field: 'Department' },
          { title: 'Vị trí ', field: 'Possition' },
          { title: 'Chú thích', field: 'Note' }
        ],
      });
      // --- trong rowClick handler ---
      this.table.on('rowClick', (evt, row: RowComponent) => {
        const rowData = row.getData();
        const id = rowData['ID'];

        this.assetAllocationService.getAssetAllocationDetail(id).subscribe(res => {
          // 1) Lấy đúng mảng detail từ API
          const details = Array.isArray(res.data.assetsallocationdetail)
            ? res.data.assetsallocationdetail
            : [];

          // 2) In ra để debug, rồi gán cho this.employeeList
          console.log('Chi tiết allocation:', details);
          this.employeeList = details;

          // 3) Vẽ lại bảng con
          this.drawDetail();
        });
      });

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
}
