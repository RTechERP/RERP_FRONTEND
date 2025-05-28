import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AssetsManagementComponent } from '../assets-management/AssetsManagement.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalService } from './assets-formServices/asset-formservice.service';
import { AssetsService } from '../assets-resouse/assets.service';
import { TypeAssetsService } from '../assets-type/TypeAssets.service';
import { TabulatorFull as Tabulator, CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet 
import { AssetsManagementService } from '../assets-management/AssetsManagementService.service';
declare var bootstrap: any;
import Swal from 'sweetalert2';
import { UnitManagementComponent } from "../assets-unit/UnitManagement.component";
@Component({
  selector: 'app-asset-modal',
  standalone: true,
  templateUrl: './asset-modal.component.html',
  imports: [CommonModule, FormsModule, NgSelectModule, UnitManagementComponent],
  providers: [AssetsManagementService, ModalService, AssetsService, TypeAssetsService]
})
export class AssetModalComponent implements AfterViewInit {
 @ViewChild('unitModal', { static: false }) modalRef!: ElementRef;
  @ViewChild('table', { static: false }) tableRef!: ElementRef;
  isEditMode: boolean = false; // Flag to track edit mode
  allocationId: number | null = null; // Store ID of allocation being edited
  @Output() allocationSaved = new EventEmitter<void>();
  @Input() modalTitle = 'Thêm tài sản';
  @Input() selectedAsset: any = {};
  @Output() saveBaoHongEvent = new EventEmitter<any>();
  @Output() saveBaoMatEvent = new EventEmitter<any>();
  @Input() selectedUnit: any = {};
  @Output() saveAsset = new EventEmitter<any>();
  department: any[] = [];
  allocationDate: string = '';
  assetdate: string = '';
  generatedCode: string = '';
  generateTSAssetCode: string = '';
  assets: any[] = [];
  typeAssets: any[] = [];
  unit: any[] = [];
  selectedDepartment = '';
  departments: any[] = [];
  employeeList: any[] = [];
  filterText: string = '';
  DateStart: string = '';
  DateEnd: string = '';
  status: string = '';
  maxAssetId: number = 0;
  employee: any[] = [];
  selectedDepartmentName: string = '';
  selectedPositionName: String = '';
  newUnitName: string = '';
  reportErrorDescription: string = ''; // Biến lưu mô tả lỗi
  reportDate: string = new Date().toISOString().split('T')[0];
  reportlostDate: string = new Date().toISOString().split('T')[0];
  reportLossDescription: string = '';
  assetTable: any;
  assetRows: any[] = [];
  selectedStatus = '';
  chucVuList: any[] = [];
  emplylist: any[] = [];
  table: Tabulator | null = null;
  ngAfterViewInit() {
    this.initTabulator(); // ✅ Gọi hàm khởi tạo bảng sau khi DOM sẵn sàng
  }
  constructor(
    private assetsmanagemnetservice: AssetsManagementService,
    private modalservice: ModalService,
    private assetsService: AssetsService,
    private typeAssetsService: TypeAssetsService
  ) { }

  ngOnInit() {
    if (!this.allocationDate) {
      const today = new Date();
      this.allocationDate = today.toISOString().split('T')[0]; // "yyyy-MM-dd"
    }
    this.modalservice.getUnit().subscribe((data: any) => {
      this.unit = data.data;
    });
    this.modalservice.getEmployeetoadd().subscribe((data: any) => {
      this.emplylist = data.data[0]; // vì data.data là mảng chứa mảng
    });

    this.modalservice.getMaxAssetId().subscribe((res: any) => {
      this.maxAssetId = res.data; // OK vì res.data là number
      this.selectedAsset.STT = this.maxAssetId + 1;
    });
    this.modalservice.getEmployee().subscribe((data: any) => {

      this.employee = data.data;
    });
    this.assetsService.getAssets().subscribe((data: any) => {
      this.assets = data.data;
    });
    this.typeAssetsService.getTypeAssets().subscribe((data: any) => {
      this.typeAssets = data.data;
    });
    this.modalservice.getDepartment().subscribe((data: any) => {
      this.department = data.data;
    });
    this.generateCode();
    this.modalservice.getEmployee().subscribe((data: any) => {
      if (!this.assetdate) {
        const today = new Date();
        this.assetdate = today.toISOString().split('T')[0];
      }
      this.employee = data.data;
      this.generateTSAssetCodde();
    });
  }
  openModalUnit() {
    const modalInstance = new bootstrap.Modal(this.modalRef.nativeElement);
    modalInstance.show();
  }
  save() {
    this.selectedAsset.TSAssetCode = this.generateTSAssetCode;
    const currentDate = new Date().toISOString(); // e.g., "2025-05-22T03:16:00.000Z"
    this.selectedAsset.CreatedDate = currentDate;
    this.selectedAsset.CreatedBy = 'AdminSW';
    this.selectedAsset.UpdatedDate = currentDate;
    this.selectedAsset.UpdatedBy = 'AdminSW';
    this.selectedAsset.DepartmentID = 0;
    this.modalservice.getMaxAssetId().subscribe((res: any) => {
      this.maxAssetId = res.data;
      this.selectedAsset.STT = this.maxAssetId + 1;
      console.log('Dữ liệu modal:', this.selectedAsset);
      this.saveAsset.emit(this.selectedAsset);
      this.hide();
    });
  }
  onEmployeeSelect(employeeID: number) {
    const emp = this.emplylist.find(e => e.ID === employeeID);
    console.log('employeeID truyền vào:', employeeID);
    console.log('Danh sách emplylist:', this.emplylist);
    if (emp) {
      this.selectedDepartmentName = emp.DepartmentName || '';
      this.selectedPositionName = emp.PositionName || '';
      this.selectedAsset.DepartmentName = emp.DepartmentName;
      this.selectedAsset.PositionName = emp.PositionName;
    } else {
      this.selectedDepartmentName = '';
      this.selectedPositionName = '';
    }
  }
  generateCode(): void {
    if (!this.allocationDate) return;

    this.modalservice.getTSCPCode(this.allocationDate).subscribe({
      next: (res) => {
        this.generatedCode = res.data;
        console.log('Mã cấp phát:', this.generatedCode);
      },
      error: (err) => {
        console.error('Lỗi khi lấy mã cấp phát:', err);
      }
    });
  }
  generateTSAssetCodde(): void {
    if (!this.assetdate) return;
    this.modalservice.getTassetCode(this.assetdate).subscribe({
      next: (code: string) => {
        this.generateTSAssetCode = code;
        console.log('Mã cấp phát ', code);
      },
      error: (err) => {
        console.error('Lỗi khi lấy mã cấp phát:', err);
      }
    });
  }
  showSelectAssetModal() {
    this.assetsmanagemnetservice.getAssetsManagement(
      this.filterText || '',
      1,
      5000,
      this.DateStart || '2023-04-01',
      this.DateEnd || '2025-05-01',
      this.selectedStatus || '1',
      this.selectedDepartment || '1,2,3,4,5,6,7'
    ).subscribe((data: any) => {
      this.assets = data.data.assets;
      if (this.table) {
        this.table.setData(this.assets);
      } else {
        this.table = new Tabulator('#datatablemanagement', {
          data: this.assets,
          layout: "fitDataFill",
          pagination: true,
          selectableRows: true, // Cho phép chọn nhiều hàng
          height: '50vh',
          movableColumns: true,
          paginationSize: 15,
          paginationSizeSelector: [5, 10, 20, 50, 100],
          reactiveData: true,
          placeholder: 'Không có dữ liệu',
          dataTree: true,
          addRowPos: "bottom",
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
              width: 60,
              cssClass: 'checkbox-center'
            },

            { title: 'STT', field: 'STT', hozAlign: 'center', width: 70, headerFilter: true },
            { title: 'ID', field: 'ID', hozAlign: 'center', width: 70, visible: false },
            { title: 'Mã tài sản', field: 'TSAssetCode', headerFilter: true },

            { title: 'Tên tài sản', field: 'TSAssetName', headerFilter: true },
            { title: 'Seri', field: 'Seri', headerFilter: true },
            { title: 'Đơn vị', field: 'UnitName', headerFilter: true },
            { title: 'Thông số', field: 'SpecificationsAsset', headerFilter: true },
            { title: 'Ngày mua', field: 'DateBuy', headerFilter: true },
            { title: 'Ngày hiệu lực', field: 'DateEffect', formatter: 'datetime', formatterParams: { inputFormat: 'yyyy-MM-ddTHH:mm:ss', outputFormat: 'dd/MM/yyyy' }, headerFilter: true },
            { title: 'Bảo hành (tháng)', field: 'Insurance', headerFilter: true },
            { title: 'Loại tài sản', field: 'AssetType', headerFilter: true },
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
                } else if (val === 'Đã thu hồi') {
                  el.style.backgroundColor = '#FFCCCC';
                  el.style.color = '#000000';
                  el.style.outline = '1px solid #e0e0e0';
                } else if (val === 'Mất') {
                  el.style.backgroundColor = '#BB0000';
                  el.style.color = '#000000';
                  el.style.outline = '1px solid #e0e0e0';
                } else if (val === 'Hỏng') {
                  el.style.backgroundColor = '#FFCCCC';
                  el.style.color = '#000000';
                  el.style.outline = '1px solid #e0e0e0';
                } else {
                  el.style.backgroundColor = '#e0e0e0';
                }
                return val;
              },
              headerFilter: true
            },
            { title: 'Mã NCC', field: 'TSCodeNCC', headerFilter: true },
            { title: 'Nguồn gốc', field: 'SourceName', headerFilter: true },
            { title: 'Người quản lý', field: 'FullName', headerFilter: true },
            { title: 'Người tạo', field: 'CreatedBy', headerFilter: true },
            { title: 'Ngày tạo', field: 'CreatedDate', formatter: 'datetime', formatterParams: { outputFormat: 'dd/MM/yyyy HH:mm' }, headerFilter: true },
            { title: 'Người cập nhật', field: 'UpdatedBy', headerFilter: true },
            { title: 'Ngày cập nhật', field: 'UpdatedDate', formatter: 'datetime', formatterParams: { outputFormat: 'dd/MM/yyyy HH:mm' }, headerFilter: true },
            { title: 'Is Allocation', field: 'IsAllocation', formatter: (cell: CellComponent) => cell.getValue() ? 'Có' : 'Không', headerFilter: true },
            { title: 'Office Active', field: 'OfficeActiveStatus', headerFilter: true },
            { title: 'Windows Active', field: 'WindowActiveStatus', headerFilter: true },
            { title: 'Mô tả chi tiết', field: 'SpecificationsAsset', headerFilter: true },
            { title: 'Ghi chú', field: 'Note', headerFilter: true }
          ]
        });
      }
    });
    const modal = new bootstrap.Modal(document.getElementById('selectAssetModal'));
    modal.show();
  }


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
  editAllocation(allocation: any): void {
    this.isEditMode = true;
    this.allocationId = allocation.ID;
    this.generatedCode = allocation.Code;
    this.allocationDate = allocation.DateAllocation.split('T')[0];
    this.selectedAsset.EmployeeID = allocation.EmployeeID;
    this.reportLossDescription = allocation.Note || '';
    this.selectedDepartmentName = allocation.Department || '';
    this.selectedPositionName = allocation.Possition || '';

    // Fetch employee details to get DepartmentID
    const emp = this.emplylist.find(e => e.ID === allocation.EmployeeID);
    if (emp) {
      this.selectedAsset.DepartmentID = emp.DepartmentID || 0;
    }

    // Populate asset table with allocation details, including detail ID
    const assetRows = allocation.AssetDetails.map((detail: any) => ({
      detailID: detail.ID, // Include detail ID
      ID: detail.AssetManagementID,
      assetCode: detail.TSCodeNCC,
      assetName: detail.TSAssetName,
      quantity: detail.Quantity,
      note: detail.Note || ''
    }));

    if (this.assetTable) {
      this.assetTable.setData(assetRows);
    }

    this.showCapphat();
  }
  saveAllocation() {
    const rows = this.assetTable.getData();
    if (rows.length === 0) {
      alert('Vui lòng chọn ít nhất một tài sản để cấp phát!');
      return;
    }

    const documentNumber = this.generatedCode;
    const issueDate = this.allocationDate;
    if (!documentNumber || !issueDate || !this.selectedAsset.EmployeeID) {
      alert('Vui lòng điền đầy đủ thông tin cấp phát!');
      return;
    }

    const assetDetails = rows.map((row: any, index: number) => ({
      STT: index + 1,
      AssetManagementID: row.ID || 0,
      Quantity: row.Quantity || 1,
      Note: row.Note || '',
      EmployeeID: this.selectedAsset.EmployeeID,
      DepartmentID: this.selectedAsset.DepartmentID || 0,
      UpdatedBy: 'system'
    }));

    const payload = {
      ID: this.allocationId || 0, // 👈 Lấy từ biến class đã gán ở editAllocation()
      Code: documentNumber,
      DateAllocation: issueDate,
      EmployeeID: this.selectedAsset.EmployeeID,
      Note: this.reportLossDescription || '',
      Status: 0,
      AssetDetails: assetDetails
    };

    console.log('📦 Payload gửi API:', payload);

    this.modalservice.postassetallocation(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Lưu cấp phát thành công',
          confirmButtonText: 'OK'
        });

        this.generatedCode = '';
        this.allocationDate = '';
        this.selectedAsset = {} as any;
        this.selectedDepartmentName = '';
        this.selectedPositionName = '';
        this.reportLossDescription = '';
        this.assetTable.clearData();

        const modal = bootstrap.Modal.getInstance(document.getElementById('capphat'));
        modal?.hide();
      },
      error: (err) => {
        console.error('❌ Lỗi lưu cấp phát:', err);
        alert('Lưu cấp phát thất bại. Vui lòng thử lại!');
      }
    });
  }
  selectAssets() {
    const selectedRows = this.table?.getSelectedData() || [];
    if (selectedRows.length === 0) {
      alert('Vui lòng chọn ít nhất một tài sản!');
      return;
    }
    // Chuyển dữ liệu từ selectedRows sang định dạng phù hợp cho assetTable
    const newRows = selectedRows.map(row => ({
      ID: row.ID,
      assetCode: row.TSAssetCode,
      assetName: row.TSAssetName,
      quantity: 1, // Mặc định số lượng là 1, có thể thay đổi theo yêu cầu
      note: row.Note || ''
    }));

    // Cập nhật bảng assetTable trong modal capphat
    if (this.assetTable) {
      this.assetTable.setData([...this.assetTable.getData(), ...newRows]);
    }

    // Đóng modal selectAssetModal
    const modal = bootstrap.Modal.getInstance(document.getElementById('selectAssetModal'));
    modal?.hide();
  }
  openUnitModal() {
    const unitModal = document.getElementById('unitModal');
    if (unitModal) {
      const modal = new bootstrap.Modal(unitModal);
      modal.show();
    }
  }
  show() {
    const modalEl = document.getElementById('assetModal');
    const modal = new bootstrap.Modal(modalEl);
    if (this.selectedAsset && this.selectedAsset.EmployeeID) {
      this.updateDepartment(this.selectedAsset.EmployeeID);
    } else {
      this.selectedAsset.Status = 'Chưa sử dụng';
      this.selectedAsset.StatusID = 1;
      this.selectedDepartmentName = '';
    }
    if (!this.selectedAsset.STT) {
      this.selectedAsset.STT = this.maxAssetId + 1;
    }
    modal.show();
  }
  showBaoHong() {
    const modalEl = document.getElementById('baohong');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  showBaoMat() {
    const modalE1 = document.getElementById('baomat');
    if (modalE1) {
      const modal = new bootstrap.Modal(modalE1);
      modal.show();
    }
  }
  showCapphat() {
    const modalE1 = document.getElementById('capphat')
    if (modalE1) {
      const modal = new bootstrap.Modal(modalE1);
      modal.show();
    }
  }
  saveBaoHong() {
    if (!this.reportErrorDescription || !this.reportDate) {
      alert('Vui lòng điền đầy đủ thông tin báo hỏng!');
      return;
    }

    const payload = {
      // Thông tin tài sản
      AssetID: this.selectedAsset.ID,
      Note: this.reportErrorDescription.trim(),
      Status: 'Hỏng',
      StatusID: 5,
      DateReportBroken: this.reportDate,
      CreatedDate: this.reportDate,
      UpdatedDate: this.reportDate,

      Reason: this.reportErrorDescription.trim(),

      // Thông tin cấp phát
      EmployeeID: this.selectedAsset.EmployeeID,
      DepartmentID: this.selectedAsset.DepartmentID,
      ChucVuID: 30, // hoặc null nếu muốn backend tự truy vấn
      DateAllocation: this.reportDate
    };

    this.saveBaoHongEvent.emit(payload); // Gửi dữ liệu lên component cha
    this.hideBaoHong();
  }
  saveBaomat() {
    if (!this.reportLossDescription || !this.reportlostDate) {
      alert('Vui lòng điền đầy đủ thông tin báo mất');
      return;
    }
    const payload = {
      AssetManagementID: this.selectedAsset.ID,
      DateLostReport: this.reportDate,
      Reason: this.reportLossDescription.trim(),
      EmployeeID: this.selectedAsset.EmployeeID,
      DepartmentID: this.selectedAsset.DepartmentID,
      ChucVuID: 30,
      DateAllocation: this.reportDate,
      Note: this.reportLossDescription.trim(),
      AssetStatus: 'Mất',
      AssetStatusID: 4,
      CreatedDate: this.reportDate,
      UpdatedDate: this.reportDate,
      UpdatedBy: 'AdminSW',
      CreatedBy: 'AdminSW'
    }
    this.saveBaoMatEvent.emit(payload); // Gửi dữ liệu lên component cha
    this.hideBaoHong();
  }

  hidebaomat() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('baomat'));
    modal?.hide();
    this.reportLossDescription = ''; // Reset mô tả lỗi
    this.reportDate = new Date().toISOString().split('T')[0]; // Reset ngày
  }
  hideBaoHong() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('baohong'));
    modal?.hide();
    this.reportErrorDescription = ''; // Reset mô tả lỗi
    this.reportDate = new Date().toISOString().split('T')[0]; // Reset ngày
  }
  private updateDepartment(employeeId: number) {
    const emp = this.employee.find(e => e.ID === employeeId);
    if (emp) {
      const dept = this.department.find(d => d.ID === emp.DepartmentID);
      this.selectedDepartmentName = dept ? dept.Name : '';
      this.selectedAsset.DepartmentID = emp.DepartmentID;
    } else {
      this.selectedDepartmentName = '';
      this.selectedAsset.DepartmentID = null;
    }
  }
  hide() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('assetModal'));
    modal?.hide();
  }
}