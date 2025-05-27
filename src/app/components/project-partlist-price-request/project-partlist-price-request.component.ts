import {
  Component,
  inject,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ProjectPartlistPriceRequestService } from './project-partlist-price-request-service/project-partlist-price-request.service';
import { ProjectPartlistPriceRequestFormComponent } from './project-partlist-price-request-form/project-partlist-price-request-form.component';
import {
  TabulatorFull as Tabulator,
  ColumnComponent,
  MenuObject,
  RowComponent,
} from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css'; // Import Tabulator stylesheet
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { from } from 'rxjs';
import { take } from 'rxjs/operators';

import { USER_NAME } from '../../shared/global';
import { EMPLOYEE_ID } from '../../shared/global';
import { ISADMIN } from '../../app.config';
import * as ExcelJS from 'exceljs';
import moment from 'moment';

@Component({
  selector: 'app-project-partlist-price-request',
  templateUrl: './project-partlist-price-request.component.html',
  styleUrls: ['./project-partlist-price-request.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectPartlistPriceRequestFormComponent,
    NgSelectModule,
  ],
})
export class ProjectPartlistPriceRequestComponent implements OnInit {
  @Output() openModal = new EventEmitter<any>();

  // Active tab tracking
  activeTabId = 2;
  dtproject: any[] = [];
  dtPOKH: any[] = [];
  loading = false;
  dtprojectPartlistPriceRequest: any[] = [];
  projectTypes: any[] = [];
  tables: Map<number, Tabulator> = new Map();
  modalData: any[] = [];
  dtcurrency: any[] = [];
  showDetailModal = false;
  // Filters
  filters: any;
  dtSupplierSale: any[] = [];

  PriceRequetsService = inject(ProjectPartlistPriceRequestService);
  constructor() {}

  ngOnInit() {
    this.filters = {
      dateStart: this.formatDateForInput(new Date(2025, 0, 1)),
      dateEnd: this.formatDateForInput(new Date(2025, 4, 3)),
      statusRequest: 1,
      projectId: 0,
      keyword: '',
      isDeleted: 0,
      projectTypeID: this.activeTabId,
      poKHID: 0,
      isCommercialProd: -1,
    };
    this.getCurrency();
    this.getSupplierSale();
    this.loadProjectTypes();
    this.loadPriceRequests();
    this.getallProject();
    this.getAllPOKH();
  }
  onFormSubmit(): void {
    this.loadPriceRequests();
    this.showDetailModal = false;
  }
  onAddClick() {
    this.modalData = [];
    this.showDetailModal = true;
  }

  onEditClick() {
    const lstTypeAccept = [-1, -2];
    const table = this.tables.get(this.activeTabId);

    if (!lstTypeAccept.includes(this.activeTabId)) {
      Swal.fire(
        'Thông báo',
        'Chỉ được sửa những sản phẩm thương mại hoặc của HCNS!',
        'info'
      );
      return;
    }

    if (!table) return;

    const selectedRows = table.getSelectedData();

    if (selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn ít nhất một dòng để chỉnh sửa.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Kiểm tra cùng EmployeeID
    const empID = selectedRows[0].EmployeeID;
    const allSameEmp = selectedRows.every((row) => row.EmployeeID === empID);

    if (!allSameEmp) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn các yêu cầu báo giá có cùng Người yêu cầu!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Gán STT cho từng dòng được chọn (như gán "STT = i + 1" trong WinForms)
    const processedRows = selectedRows.map((row, index) => ({
      ...row,
      STT: index + 1,
    }));

    this.modalData = processedRows;
    this.showDetailModal = true;
  }

  onDeleteClick() {
    const table = this.tables.get(this.activeTabId);
    if (!table) return;

    const selectedRows = table.getSelectedRows();

    if (selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn ít nhất một dòng để xóa.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc muốn đánh dấu xóa các dòng đã chọn không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const updateData = selectedRows.map((row) => {
        const data = row.getData();
        return {
          ID: data['ID'],
          IsDeleted: true,
          UpdatedBy: USER_NAME,
          UpdatedDate: new Date().toISOString(),
        };
      });

      // Gửi về server qua hàm save chung
      this.saveDataCommon(updateData, 'Xóa dữ yêu cầu thành công');
    });
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private getSupplierSale() {
    this.PriceRequetsService.getSuplierSale()
      // .pipe(take(50))
      .subscribe((response) => {
        this.dtSupplierSale = response.data;
        console.log('dtsuppliersale: ', this.dtSupplierSale);
      });
  }
  private loadProjectTypes(): void {
    const employeeID = 0;
    this.PriceRequetsService.getTypes(employeeID).subscribe((response) => {
      this.projectTypes = response.data.dtType;
      console.log('Types:', this.projectTypes);

      setTimeout(() => {
        this.projectTypes.forEach((type) => {
          this.createTableForType(type.ProjectTypeID);
        });
      }, 100);
    });
  }
  private getallProject() {
    this.PriceRequetsService.getProject().subscribe((response) => {
      this.dtproject = response.data;
      console.log('PriceRequests:', this.dtproject);
    });
  }
  private getCurrency() {
    this.PriceRequetsService.getCurrency().subscribe((response) => {
      this.dtcurrency = response.data;
      console.log('dtcurrentcy: ', this.dtcurrency);
    });
  }
  private getAllPOKH() {
    this.PriceRequetsService.getPOKH().subscribe((response) => {
      this.dtPOKH = response.data;
      console.log('POKH:', this.dtPOKH);
    });
  }
  private loadPriceRequests(): void {
    // const dateStartFormatted = this.formatDateForApi(this.filters.dateStart);
    // const dateEndFormatted = this.formatDateForApi(this.filters.dateEnd);
    // if (this.filters.projectTypeID === -1) {
    //   this.filters.isCommercialProd = 1;
    // }
    // this.PriceRequetsService.getAllPartlist(
    //   dateStartFormatted,
    //   dateEndFormatted,
    //   this.filters.statusRequest - 1,
    //   this.filters.projectId,
    //   this.filters.keyword,
    //   this.filters.isDeleted,
    //   this.filters.projectTypeID,
    //   this.filters.poKHID,
    //   this.filters.isCommercialProd
    // ).subscribe((response) => {
    //   this.dtprojectPartlistPriceRequest = response.data.dtData;
    //   console.log('PriceRequests:', this.dtprojectPartlistPriceRequest);
    //   this.updateActiveTable();
    // });
    const table = this.tables.get(this.activeTabId);
    if (table) {
      // Đặt lại trang về 1
      table.setPage(1);
      // Tải lại dữ liệu với tham số AJAX hiện tại
      table.setData();
    }
  }
  private formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${
      date.getHours() === 0 ? '12:00:00 AM' : '11:59:59 PM'
    }`;
  }

  public applyFilters(): void {
    console.log(this.filters.poKHID);
    const table = this.tables.get(this.activeTabId);
    if (table) {
      // Đặt lại trang về 1 khi áp dụng bộ lọc mới
      table.setPage(1);
      // Cập nhật tham số AJAX và tải lại dữ liệu
      table.setData();
    }
  }

  public resetFilters(): void {
    this.filters = {
      dateStart: this.formatDateForInput(new Date(2025, 0, 1)),
      dateEnd: this.formatDateForInput(new Date()),
      statusRequest: 1,
      projectId: 0,
      keyword: '',
      isDeleted: 0,
      projectTypeID: this.activeTabId,
      poKHID: 0,
      isCommercialProd: -1,
    };

    const table = this.tables.get(this.activeTabId);
    if (table) {
      // Đặt lại trang về 1 khi đặt lại bộ lọc
      table.setPage(1);
      // Cập nhật tham số AJAX và tải lại dữ liệu
      table.setData();
    }
  }

  public selectProjectType(typeId: number): void {
    this.activeTabId = typeId;
    this.filters.projectTypeID = typeId;

    // Kiểm tra nếu bảng đã tồn tại
    if (!this.tables.has(typeId)) {
      this.createTableForType(typeId);
    }

    const table = this.tables.get(typeId);
    if (table) {
      // Đặt lại trang về 1 khi chuyển loại dự án
      table.setPage(1);
      // Cập nhật tham số AJAX và tải lại dữ liệu
      table.setData();
    }
  }

  private createTableForType(typeId: number): void {
    const tableId = `datatable-${typeId}`;
    const element = document.getElementById(tableId);

    if (!element) {
      console.error(`Table container not found: ${tableId}`);
      return;
    }

    const table = new Tabulator(`#${tableId}`, this.getTableConfig());
    this.tables.set(typeId, table);
  }

  private updateActiveTable(): void {
    const tableId = this.activeTabId;
    if (!this.tables.has(tableId)) {
      this.createTableForType(tableId);
    }

    const table = this.tables.get(tableId);
    if (table) {
      table.setData(this.dtprojectPartlistPriceRequest);
    }
  }
  calculateTotalPriceExchange(rowData: any, currencyRate: number): number {
    const totalMoney = Number(rowData.TotalPrice) || 0;
    return totalMoney * currencyRate;
  }
  getDataChanged() {
    const tableId = this.activeTabId;
    const table = this.tables.get(tableId);
    if (!table) return;
    table.on('dataChanged', function (data) {});
  }
  private saveDataCommon(
    data: any[],
    successMessage: string = 'Dữ liệu đã được lưu.'
  ): void {
    if (data.length === 0) {
      Swal.fire('Thông báo', 'Không có dữ liệu thay đổi.', 'info');
      return;
    }

    this.PriceRequetsService.saveChangedData(data).subscribe({
      next: (response) => {
        if ((response as any).status === 1) {
          this.loadPriceRequests();
          Swal.fire(
            'Thành công',
            (response as any).message || successMessage,
            'success'
          );
        } else {
          Swal.fire(
            'Lỗi',
            (response as any).message || 'Có lỗi xảy ra',
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Lỗi khi lưu dữ liệu:', error);
        Swal.fire('Thông báo', 'Không thể lưu dữ liệu.', 'error');
      },
    });
  }

  onSaveData(): void {
    const table = this.tables.get(this.activeTabId);
    if (!table) return;

    const editedCells = table.getEditedCells();
    const changedRowsMap = new Map<number, any>();

    editedCells.forEach((cell) => {
      const row = cell.getRow();
      const data = row.getData();
      changedRowsMap.set(Number(data['ID']), data);
    });

    const changedData = Array.from(changedRowsMap.values());

    if (changedData.length === 0) {
      Swal.fire('Thông báo', 'Không có dữ liệu thay đổi.', 'info');
      return;
    }

    // Chỉ giữ lại các trường hợp lệ
    const validFields = [
      'ID',
      'EmployeeID',
      'Deadline',
      'Note',
      'Unit',
      'Quantity',
      'TotalPrice',
      'UnitPrice',
      'VAT',
      'TotaMoneyVAT',
      'CurrencyID',
      'CurrencyRate',
      'IsCheckPrice',
      'SupplierSaleID',
      'DateExpected',
      'TotalDayLeadTime',
      'TotalPriceExchange',
    ];
    if (!ISADMIN) {
      validFields.push('QuoteEmployeeID');
      validFields.push('UpdatedBy');
    }
    const filteredData = changedData.map((item) => {
      const filteredItem: any = {};
      validFields.forEach((key) => {
        if (item.hasOwnProperty(key)) {
          filteredItem[key] = item[key];
        }
      });
      filteredItem.UpdatedDate = moment().toDate();
      filteredItem.UpdatedBy = !ISADMIN ? USER_NAME : '';
      return filteredItem;
    });

    console.log('Dữ liệu đã lọc:', filteredData);

    this.saveDataCommon(filteredData, 'Dữ liệu đã được lưu.');
  }

  addWeekdays(date: Date, days: number): Date {
    let count = 0;
    let result = new Date(date.getTime());

    while (count < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) {
        // Skip Sunday (0) and Saturday (6)
        count++;
      }
    }

    return result; // Return the modified date
  }
  updateValue(rowData: any): void {
    const quantity = Number(rowData.Quantity) || 0;
    const unitPrice = Number(rowData.UnitPrice) || 0;
    const unitImportPrice = Number(rowData.UnitImportPrice) || 0;
    const vat = Number(rowData.VAT) || 0;
    const leadTime = Number(rowData.TotalDayLeadTime) || 0;
    const currencyRate = Number(rowData.CurrencyRate) || 1;

    // Thành tiền
    const totalPrice = quantity * unitPrice;
    rowData.TotalPrice = totalPrice;

    // Thành tiền quy đổi (VNĐ)
    rowData.TotalPriceExchange = this.calculateTotalPriceExchange(
      rowData,
      currencyRate
    );

    // Thành tiền nhập khẩu
    const totalPriceImport = quantity * unitImportPrice;
    rowData.TotalImportPrice = totalPriceImport;

    // Thành tiền có VAT
    const totalMoneyVAT = totalPrice + (totalPrice * vat) / 100;
    rowData.TotaMoneyVAT = totalMoneyVAT;

    // Tính ngày về dự kiến
    if (rowData.TotalDayLeadTime !== undefined) {
      rowData.DateExpected = this.addWeekdays(moment().toDate(), leadTime);
    }
  }

  handleCellEdited(cell: any) {
    const row = cell.getRow();
    const data = row.getData();

    // Lấy các giá trị cần thiết từ dòng
    const unitPrice = Number(data.UnitPrice) || 0;
    const importPrice = Number(data.UnitImportPrice) || 0;
    const quantity = Number(data.Quantity) || 0;
    const vat = Number(data.VAT) || 0;
    const currencyRate = Number(data.CurrencyRate) || 1;

    // Tính toán lại
    const totalPrice = unitPrice * quantity;
    const totalPriceImport = quantity * importPrice;
    const totalVAT = totalPrice + (totalPrice * vat) / 100;
    const totalPriceExchange = totalPrice * currencyRate;

    const leadtime = Number(data.TotalDayLeadTime);
    const dateexpect = this.addWeekdays(moment().toDate(), leadtime);

    // Cập nhật lại các cột liên quan
    row.update({
      DateExpected: dateexpect,
      TotalImportPrice: totalPriceImport,
      TotalPrice: totalPrice,
      TotaMoneyVAT: totalVAT,
      TotalPriceExchange: totalPriceExchange,
    });
  }
  onCurrencyChanged(cell: any) {
    const code = Number(cell.getValue());
    const currency = this.dtcurrency.find((p: { ID: number }) => p.ID === code);
    if (currency) {
      const rate = currency.CurrencyRate;
      // const finalRate = rate; // xử lý expired nếu cần

      const rowData = cell.getRow().getData();
      const totalPrice = this.calculateTotalPriceExchange(rowData, rate);

      cell.getRow().update({
        CurrencyID: currency.ID,
        CurrencyRate: currency.CurrencyRate,
        TotalPriceExchange: totalPrice,
      });
    }
  }
  onSupplierSaleChanged(cell: any) {
    const supplierId = cell.getValue();
    const supplier = this.dtSupplierSale.find(
      (p: { ID: number }) => p.ID === supplierId
    );

    if (supplier) {
      const row = cell.getRow();
      row.update({ CodeNCC: supplier.CodeNCC });
    }
  }
QuotePrice(status: number = 2): void {
  const table = this.tables.get(this.activeTabId);
  if (!table) return;

  // Map trạng thái
  const STATUS_TEXT: { [key: number]: string } = {
    0: 'Hủy hoàn thành',
    1: 'Hủy báo giá', 
    2: 'Báo giá',
    3: 'Hoàn thành'
  };
  
  const statusText = STATUS_TEXT[status] || '';
  const selectedRows = table.getSelectedRows();
  
  // Validate chọn dòng
  if (selectedRows.length === 0) {
    Swal.fire({
      title: 'Thông báo',
      text: `Vui lòng chọn sản phẩm muốn ${statusText}!`,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
    return;
  }

  // Xử lý dữ liệu
  const updateData:any[] = [];
  const shouldValidate = ![1, 3].includes(status);
  
  for (const row of selectedRows) {
    const rowData = row.getData();
    const id = Number(rowData['ID']);
    
    // Bỏ qua các dòng không hợp lệ
    if (id <= 0) continue;

    // Validate cho các trường hợp cần kiểm tra
    if (shouldValidate) {
      const productCode = rowData['ProductCode'] || '';
      const currencyId = Number(rowData['CurrencyID']);
      const currencyCode = rowData['CurrencyCode'] || '';
      const currencyRate = Number(rowData['CurrencyRate']);
      const unitPrice = Number(rowData['UnitPrice']);
      const supplierSaleId = Number(rowData['SupplierSaleID']);

      if (currencyId <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Vui lòng nhập Loại tiền mã sản phẩm [${productCode}]!`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }

      if (currencyRate <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Tỷ giá của [${currencyCode}] phải > 0.\nVui lòng kiểm tra lại Ngày hết hạn!`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }

      if (unitPrice <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Vui lòng nhập Đơn giá mã sản phẩm [${productCode}]!`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }

      if (supplierSaleId <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Vui lòng nhập Nhà cung cấp mã sản phẩm [${productCode}]!`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    // Cập nhật dữ liệu
    Object.assign(rowData, {
      StatusRequest: status,
      UpdatedBy: USER_NAME,
      UpdatedDate: new Date(),
      QuoteEmployeeID: !ISADMIN ? EMPLOYEE_ID : rowData['QuoteEmployeeID'],
      DatePriceQuote: status === 2 ? new Date() : status === 1 ? null : rowData['DatePriceQuote']
    });

    updateData.push(rowData);
  }

  // Xác nhận thao tác
  Swal.fire({
    title: 'Thông báo',
    text: `Bạn có chắc muốn ${statusText} danh sách sản phẩm đã chọn không?\nNhững sản phẩm NV mua không phải bạn sẽ tự động được bỏ qua!`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
  }).then((result) => {
    if (result.isConfirmed) {
      this.saveDataCommon(updateData, `${statusText} thành công`);
    }
  });
}

  // Cập nhật phương thức CheckPrice để sử dụng hàm chung
  CheckPrice(isCheckPrice: boolean): void {
    const table = this.tables.get(this.activeTabId);
    if (!table) return;

    const isCheckText = isCheckPrice ? 'Check giá' : 'Huỷ check giá';
    const selectedRows = table.getSelectedRows();

    if (selectedRows.length <= 0) {
      Swal.fire(
        'Thông báo',
        `Vui lòng chọn sản phẩm muốn ${isCheckText}!`,
        'warning'
      );
      return;
    }

    // Xác nhận thao tác
    Swal.fire({
      title: 'Thông báo',
      text: `Bạn có chắc muốn ${isCheckText} danh sách sản phẩm đã chọn không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        // Lấy dữ liệu từ các dòng đã chọn
        const updateData = selectedRows.map((row) => {
          const rowData = row.getData();
          return {
            ID: Number(rowData['ID']),
            IsCheckPrice: isCheckPrice,
            QuoteEmployeeID: isCheckPrice ? EMPLOYEE_ID : 0,
            UpdatedBy: USER_NAME,
            UpdatedDate: moment().toDate(),
          };
        });

        // Sử dụng hàm chung để lưu dữ liệu
        this.saveDataCommon(updateData, `${isCheckText} thành công`);
      }
    });
  }
  async exportToExcelAdvanced() {
    const table = this.tables.get(this.activeTabId);
    if (!table) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách yêu cầu báo giá');

    // Lấy dữ liệu
    const data = table.getData('active');
    const columns = table
      .getColumnDefinitions()
      .filter((col: any) => col.visible !== false);

    // Thêm headers
    const headerRow = worksheet.addRow(columns.map((col: any) => col.title));
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Thêm dữ liệu
    data.forEach((row: any) => {
      const rowData = columns.map((col: any) => {
        const value = row[col.field];

        // Xử lý null/undefined thành khoảng trống
        if (value === null || value === undefined) {
          return '';
        }

        // Xử lý object rỗng
        if (
          typeof value === 'object' &&
          value !== null &&
          Object.keys(value).length === 0
        ) {
          return '';
        }

        // Xử lý các trường đặc biệt
        if (col.field === 'IsCheckPrice') {
          return value ? 'Có' : 'Không';
        }

        // Xử lý trường ngày báo giá
        if (col.field === 'DatePriceQuote') {
          if (
            !value ||
            value === '' ||
            (typeof value === 'object' && Object.keys(value).length === 0)
          ) {
            return '';
          }
          return value;
        }

        // Xử lý các trường số với formatter
        if (
          col.field === 'UnitPrice' ||
          col.field === 'TotalPriceExchange' ||
          col.field === 'TotaMoneyVAT' ||
          col.field === 'TotalImportPrice'
        ) {
          return value === 0 ? 0 : value || '';
        }

        // Xử lý trường select với lookup
        if (col.field === 'CurrencyID') {
          const currency = this.dtcurrency?.find((c: any) => c.ID === value);
          return currency ? currency.Code : '';
        }

        if (col.field === 'SupplierSaleID') {
          const supplier = this.dtSupplierSale?.find(
            (s: any) => s.ID === value
          );
          return supplier ? supplier.NameNCC : '';
        }

        // Xử lý chuỗi rỗng
        if (value === '') {
          return '';
        }

        // Return giá trị bình thường
        return value;
      });
      worksheet.addRow(rowData);
    });

    // Auto-fit columns với xử lý an toàn
    worksheet.columns.forEach((column, index) => {
      const col = columns[index];
      if (col.width) {
        // Kiểm tra nếu width là string và chứa 'vh'
        if (typeof col.width === 'string' && col.width.includes('vh')) {
          column.width = parseFloat(col.width.replace('vh', '')) * 2;
        }
        // Nếu width là number
        else if (typeof col.width === 'number') {
          column.width = col.width;
        }
        // Nếu width là string nhưng không chứa 'vh'
        else if (typeof col.width === 'string') {
          column.width = parseFloat(col.width) || 15;
        }
      } else {
        column.width = 15;
      }
    });

    // Thêm border cho tất cả cells
    const range =
      worksheet.getCell('A1').address +
      ':' +
      worksheet.getCell(data.length + 1, columns.length).address;

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Căn giữa cho header
        if (rowNumber === 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `price-request-${
      new Date().toISOString().split('T')[0]
    }.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
  private getTableConfig(): any {
    return {
      // data: this.dtprojectPartlistPriceRequest,
      layout: 'fitDataFill',
      height: '68vh',
      virtualDom: true,
      rowHeader: {
        headerSort: false,
        resizable: false,
        frozen: true,
        headerHozAlign: 'center',
        hozAlign: 'center',
        formatter: 'rowSelection',
        titleFormatter: 'rowSelection',
        cellClick: function (e: any, cell: any) {
          cell.getRow().toggleSelect();
        },
      },
      ajaxURL: this.PriceRequetsService.getAPIPricerequest(),
      ajaxParams: () => {
        const filters = this.filters;

        // Sửa statusRequest = -1 nếu không muốn lọc, hoặc truyền đúng
        let statusRequest = filters.statusRequest;
        if (statusRequest < 0) statusRequest = 0;

        // Xử lý projectTypeID và isCommercialProduct logic giống như ở backend
        let isCommercialProduct =
          filters.projectTypeID === -1 ? 1 : filters.isCommercialProd;
        let poKHID = filters.projectTypeID >= 0 ? 0 : filters.poKHID;

        return {
          dateStart: this.formatDateForApi(filters.dateStart),
          dateEnd: this.formatDateForApi(filters.dateEnd),
          statusRequest: statusRequest,
          projectId: filters.projectId,
          keyword: filters.keyword,
          isDeleted: filters.isDeleted,
          projectTypeID: filters.projectTypeID,
          poKHID: poKHID,
          isCommercialProduct: isCommercialProduct,
          page: 1, // thêm tham số phân trang nếu cần
          size: 25,
        };
      },
      ajaxConfig: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },

      paginationMode: 'remote',
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      paginationInitialPage: 1,
      ajaxResponse: function (url: string, params: any, response: any) {
        // Xử lý dữ liệu trả về từ API
        return {
          data: response.data.dtData,
          last_page: response.data.totalPages,
        };
      },
      ajaxError: function (xhr: any, textStatus: any, errorThrown: any) {
        console.error('Lỗi AJAX:', textStatus, errorThrown);
        Swal.fire(
          'Lỗi',
          'Không thể tải dữ liệu từ server. Vui lòng thử lại sau.',
          'error'
        );
      },
      langs: {
        vi: {
          pagination: {
            first: '<<',
            last: '>>',
            prev: '<',
            next: '>',
            page_size: 'Số dòng:',
          },
        },
      },
      locale: 'vi',
      columnDefaults: {
        headerContextMenu: [
          {
            label: 'Xoá sắp xếp',
            action: (e: MouseEvent, column: ColumnComponent) => {
              column.getTable().clearSort();
            },
          },
        ] as MenuObject<ColumnComponent>[],
      },
      rowContextMenu: [
        {
          label: 'Xem chi tiết',
          action: (e: MouseEvent, row: RowComponent) => {
            this.onEditClick();
          },
        },
        { separator: true },
      ] as MenuObject<RowComponent>[],
      columns: [
        {
          title: 'ID',
          field: 'ID',
          visible: false,
          headerHozAlign: 'center',
          frozen: true,
        },
        { title: 'TT', field: 'TT', headerHozAlign: 'center', frozen: true },
        {
          title: 'Check giá',
          field: 'IsCheckPrice',
          hozAlign: 'center',
          headerSort: false,
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value === true
              ? '<i class="fa fa-check" style="color:green;"></i>'
              : '<i style="color:red;" class="fa fa-times"></i>';
          },
          frozen: true,
        },
        {
          title: 'Mã dự án',
          field: 'ProjectCode',
          headerHozAlign: 'center',
          frozen: true,
        },
        {
          title: 'Mã sản phẩm',
          field: 'ProductCode',
          headerHozAlign: 'center',
          frozen: true,
          width: '15vh',
        },
        {
          title: 'Tên sản phẩm',
          field: 'ProductName',
          headerHozAlign: 'center',
          frozen: true,
          width: '20vh',
        },
        {
          title: 'Hãng',
          field: 'Manufacturer',
          headerHozAlign: 'center',
          frozen: true,
        },
        {
          title: 'Số lượng',
          field: 'Quantity',
          headerHozAlign: 'center',
        },
        {
          title: 'ĐVT',
          field: 'UnitCount',
          headerHozAlign: 'center',
        },
        {
          title: 'Trạng thái',
          field: 'StatusRequestText',
          headerHozAlign: 'center',
        },
        {
          title: 'Người yêu cầu',
          field: 'FullName',
          headerHozAlign: 'center',
        },
        {
          title: 'Sale phụ trách',
          field: 'FullNameSale',
          headerHozAlign: 'center',
        },
        {
          title: 'NV báo giá',
          field: 'QuoteEmployee',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày yêu cầu',
          field: 'DateRequest',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        { title: 'Deadline', field: 'Deadline', headerHozAlign: 'center' },
        {
          title: 'Ngày báo giá',
          field: 'DatePriceQuote',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Loại tiền',
          field: 'CurrencyID',
          editor: 'list',
          formatter: (cell: any) => {
            const value = cell.getValue();
            const match = this.dtcurrency.find((c) => c.ID === value);
            return match ? match.Code : '';
          },
          editorParams: {
            values: this.dtcurrency.map((s) => ({
              value: s.ID,
              label: s.Code,
            })),

            autocomplete: true,
          },
          cellEdited: (cell: any) => this.onCurrencyChanged(cell),
        },

        { title: 'Tỷ giá', field: 'CurrencyRate', headerHozAlign: 'center' },
        {
          title: 'Đơn giá',
          field: 'UnitPrice',
          headerHozAlign: 'center',
          editor: 'input',
          cellEdited: (cell: any) => this.handleCellEdited(cell),
        },
        {
          title: 'Giá lịch sử',
          field: 'HistoryPrice',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Thành tiền quy đổi (VNĐ)',
          field: 'TotalPriceExchange',
          headerHozAlign: 'center',
        },
        {
          title: '% VAT',
          field: 'VAT',
          headerHozAlign: 'center',
          editor: 'input',
          cellEdited: (cell: any) => this.handleCellEdited(cell),
        },
        {
          title: 'Thành tiền có VAT',
          field: 'TotaMoneyVAT',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Mã NCC',
          field: 'CodeNCC',
          formatter: function (
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
          title: 'Nhà cung cấp',
          field: 'SupplierSaleID',
          headerHozAlign: 'center',
          editor: 'list',
          formatter: (cell: any) => {
            const value = cell.getValue();
            const match = this.dtSupplierSale.find((s) => s.ID === value);
            return match ? match.NameNCC : '';
          },
          editorParams: {
            values: this.dtSupplierSale.map((sup) => ({
              value: sup.ID,
              label: sup.NameNCC,
            })),
            autocomplete: true,
          },
          cellEdited: (cell: any) => this.onSupplierSaleChanged(cell),
        },

        {
          title: 'Lead Time (Ngày làm việc)',
          field: 'TotalDayLeadTime',
          headerHozAlign: 'center',

          editor: 'input',
          cellEdited: (cell: any) => this.handleCellEdited(cell),
        },
        {
          title: 'Ngày dự kiến hàng về',
          field: 'DateExpected',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        { title: 'Ghi chú', field: 'Note', headerHozAlign: 'center' },
        {
          title: 'Ghi chú KT',
          field: 'NotePartlist',
          width: 200,
          headerHozAlign: 'center',
        },
        {
          title: 'Thông số kỹ thuật',
          field: 'Model',
          headerHozAlign: 'center',
        },
        {
          title: 'Đơn giá xuất xưởng',
          field: 'UnitFactoryExportPrice',
          editor: 'input',
          headerHozAlign: 'center',
        },
        {
          title: 'Đơn giá nhập khẩu',
          field: 'UnitImportPrice',
          headerHozAlign: 'center',
          formatter: function (
            cell: any,
            formatterParams: any,
            onRendered: any
          ) {
            let value = cell.getValue() || '';
            return value;
          },
          cellEdited: (cell: any) => this.handleCellEdited(cell),
        },
        {
          title: 'Thành tiền nhập khẩu',
          field: 'TotalImportPrice',
          headerHozAlign: 'center',
          formatter: function (
            cell: any,
            formatterParams: any,
            onRendered: any
          ) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Lead Time',
          field: 'LeadTime',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        {
          title: 'Lý do xoá',
          field: 'ReasonDeleted',
          headerHozAlign: 'center',
        },
      ],
    };
  }
}
