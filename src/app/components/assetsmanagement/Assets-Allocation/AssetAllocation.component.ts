import { Component, OnInit, ViewChild, } from '@angular/core';
import { AssetAllocationService } from './AssetAllocationService/AssetAllocation.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import { data } from 'jquery';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../assets-form/assets-formServices/asset-formservice.service';
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
  imports: [AssetModalComponent, CommonModule,FormsModule,NgSelectModule]
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
  employeeID: string = '0';    
  status: string = '';          
  filterText: string = '';    
  pageSize: number = 1000000;
  pageNumber: number = 1;
  table: Tabulator | null = null;
  detailtable: Tabulator | null = null;
  
  
  constructor(private assetAllocationService: AssetAllocationService,
    private employeeService: EmployeeService
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
      this.employeeService.getEmployeetoadd().subscribe((data: any) => {
      this.emplylist = data.data[0];
    });
  }
 getAll(): void {
  const employeeId = parseInt(this.employeeID) || 0; // Chuyển thành số, mặc định là 0 nếu không hợp lệ
  this.assetAllocationService.getAssetsManagement(
    this.dateStart || '2012-04-01',
    this.dateEnd || '2025-05-01',
    employeeId,  // Sử dụng employeeID đã chọn
    1,  // Status
    this.filterText,
    this.pageSize,
    this.pageNumber
  ).subscribe((data: any) => {
    this.assetallocation = data.data.assetallocation || [];
    this.drawTable();
  });
}
  getEmployees(): void {
    this.employeeService.getEmployeetoadd().subscribe({
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
          { title: 'ID', field: 'ID'},
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
      // --- trong rowClick handler ---
      this.table.on('rowClick', (evt, row: RowComponent) => {
        const rowData = row.getData();
        const id = rowData['ID'];
        console.log("hgff",id);

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

DeleteALLocationn():void
{
  const ids=this.getSelectedIds();
  if(ids.length==0) return alert("Vui lòng chọn ít nhất một dòng");
  this.assetAllocationService.DeleteAllocation(ids).subscribe({
    next:res=>{
      alert('Xóa thành công');
      this.getAll();
    },
    error:err=>alert('Lỗi khi xóa')
  });
}
handleApprovalAction(action: 'HR_APPROVE' | 'HR_CANCEL' | 'ACCOUNTANT_APPROVE' | 'ACCOUNTANT_CANCEL') {
   const ids = this.getSelectedIds();
   console.log('ID đã chọn',ids)
  if (ids.length === 0) return alert("Vui lòng chọn ít nhất một dòng!");
  

  this.assetAllocationService.updateApprovalStatus(ids, action).subscribe({
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
    this.searchText = '';
    this.DateStart = '';
    this.DateEnd = '';
    this.employeeID = '0';
    this.status = '';
    this.onFilterChange();
  }
}
  searchText: string = '';
 onSearchChange(): void {
    if (!this.table) return;
    const value = this.searchText.trim();
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
