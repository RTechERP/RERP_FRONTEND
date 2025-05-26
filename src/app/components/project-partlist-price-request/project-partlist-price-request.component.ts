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

    const selectedRows = table.getSelectedData();

    if (selectedRows.length > 0) {
    } else {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn ít nhất một dòng để xóa.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    }
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
    const dateStartFormatted = this.formatDateForApi(this.filters.dateStart);
    const dateEndFormatted = this.formatDateForApi(this.filters.dateEnd);
    if (this.filters.projectTypeID === -1) {
      this.filters.isCommercialProd = 1;
    }
    this.PriceRequetsService.getAllPartlist(
      dateStartFormatted,
      dateEndFormatted,
      this.filters.statusRequest - 1,
      this.filters.projectId,
      this.filters.keyword,
      this.filters.isDeleted,
      this.filters.projectTypeID,
      this.filters.poKHID,
      this.filters.isCommercialProd
    ).subscribe((response) => {
      this.dtprojectPartlistPriceRequest = response.data.dtData;
      console.log('PriceRequests:', this.dtprojectPartlistPriceRequest);
      this.updateActiveTable();
    });
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
    this.loadPriceRequests();
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
    this.loadPriceRequests();
  }

  public selectProjectType(typeId: number): void {
    this.activeTabId = typeId;
    this.filters.projectTypeID = typeId;
    this.loadPriceRequests();
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
      'UpdatedBy',
    ];

    const filteredData = changedData.map((item) => {
      const filteredItem: any = {};
      validFields.forEach((key) => {
        if (item.hasOwnProperty(key)) {
          filteredItem[key] = item[key];
        }
      });
      filteredItem.UpdatedDate = new Date();
      return filteredItem;
    });

    console.log('Dữ liệu đã lọc:', filteredData);

    this.PriceRequetsService.saveChangedData(filteredData).subscribe({
      next: () => {
        Swal.fire('Thông báo', 'Dữ liệu đã được lưu.', 'success');
      },
      error: (err) => {
        console.error('Lỗi khi lưu dữ liệu:', err);
        Swal.fire('Thông báo', 'Không thể lưu dữ liệu.', 'error');
      },
    });
    this.loadPriceRequests();
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
      rowData.DateExpected = this.addWeekdays(new Date(), leadTime);
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
    const dateexpect = this.addWeekdays(new Date(), leadtime);

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
  
    // Lấy text trạng thái dựa vào status
    const statusText = status === 0 ? "Hủy hoàn thành" : 
                    (status === 1 ? "Hủy báo giá" : 
                    (status === 2 ? "Báo giá" : 
                    (status === 3 ? "Hoàn thành" : "")));
  
    // Lấy các dòng đã chọn
    const selectedRows = table.getSelectedRows();
    if (selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: `Vui lòng chọn sản phẩm muốn ${statusText}!`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    // Kiểm tra validate
    for (const row of selectedRows) {
      if (status === 1 || status === 3) continue;
  
      const rowData = row.getData();
      const id = Number(rowData['ID']);
      if (id <= 0) continue;
  
      // Kiểm tra người báo giá
      if (rowData['QuoteEmployeeID'] !== EMPLOYEE_ID) continue;
  
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
          confirmButtonText: 'OK'
        });
        return;
      } else if (currencyRate <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Tỷ giá của [${currencyCode}] phải > 0.\nVui lòng kiểm tra lại Ngày hết hạn!`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      if (unitPrice <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Vui lòng nhập Đơn giá mã sản phẩm [${productCode}]!`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
  
      if (supplierSaleId <= 0) {
        Swal.fire({
          title: 'Thông báo',
          text: `Vui lòng nhập Nhà cung cấp mã sản phẩm [${productCode}]!`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
    }
  
    // Xác nhận thao tác
    status = status === 0 ? 1 : status;
    Swal.fire({
      title: 'Thông báo',
      text: `Bạn có chắc muốn ${statusText} danh sách sản phẩm đã chọn không?\nNhững sản phẩm NV mua không phải bạn sẽ tự động được bỏ qua!`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lấy danh sách dữ liệu cần cập nhật - chỉ gửi các trường cần thiết
        const updateData = selectedRows.map(row => {
          const rowData = row.getData();
          if (rowData['QuoteEmployeeID'] !== EMPLOYEE_ID) return null;
          
          // Chỉ gửi các trường cần thiết để tận dụng UpdateFieldsByID
          return {
            ID: Number(rowData['ID']),
            StatusRequest: status,
            UpdatedBy: USER_NAME,
            UpdatedDate: new Date(),
            DatePriceQuote: status === 1 ? null : (status === 2 ? new Date().toISOString() : null),
            // Các trường bắt buộc cho báo giá
            CurrencyID: rowData['CurrencyID'],
            CurrencyRate: rowData['CurrencyRate'],
            UnitPrice: rowData['UnitPrice'],
            SupplierSaleID: rowData['SupplierSaleID'],
            TotalPrice: rowData['TotalPrice'],
            TotalPriceExchange: rowData['TotalPriceExchange'],
            VAT: rowData['VAT'],
            TotaMoneyVAT: rowData['TotaMoneyVAT']
          };
        }).filter(item => item !== null);
  
        if (updateData.length === 0) return;
  
        // Gọi API cập nhật dữ liệu
        this.PriceRequetsService.saveChangedData(updateData).subscribe({
          next: (response) => {
            if ((response as any).status === 1) {
              this.loadPriceRequests();
              Swal.fire('Thành công', (response as any).message || 'Cập nhật thành công', 'success');
            } else {
              Swal.fire('Lỗi', (response as any).message || 'Có lỗi xảy ra', 'error');
            }
          },
          error: (error) => {
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi cập nhật trạng thái!', 'error');
            console.error('Lỗi:', error);
          }
        });
      }
    });
  }
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
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lấy dữ liệu từ các dòng đã chọn
        const updateData = selectedRows.map(row => {
          const rowData = row.getData();
          return {
            ID: Number(rowData['ID']),
            EmployeeID: rowData['EmployeeID'],
            Deadline: rowData['Deadline'],
            Note: rowData['Note'],
            Unit: rowData['Unit'],
            Quantity: rowData['Quantity'],
            TotalPrice: rowData['TotalPrice'],
            UnitPrice: rowData['UnitPrice'],
            VAT: rowData['VAT'],
            TotaMoneyVAT: rowData['TotaMoneyVAT'],
            CurrencyID: rowData['CurrencyID'],
            CurrencyRate: rowData['CurrencyRate'],
            IsCheckPrice: isCheckPrice,
            SupplierSaleID: rowData['SupplierSaleID'],
            UpdatedBy: USER_NAME,
            UpdatedDate: new Date().toISOString()
            // UpdatedDate: new Date().toISOString()

          };
        });

        // Gọi API cập nhật dữ liệu
        this.PriceRequetsService.saveChangedData(updateData).subscribe({
          next: (response) => {
            if ((response as any).status === 1) {
              this.loadPriceRequests();
              Swal.fire('Thành công', (response as any).message || 'Cập nhật thành công', 'success');
            } else {
              Swal.fire('Lỗi', (response as any).message || 'Có lỗi xảy ra', 'error');
            }
          },
          error: (error) => {
            Swal.fire('Lỗi', 'Đã xảy ra lỗi khi cập nhật trạng thái!', 'error');
            console.error('Lỗi:', error);
          }
        });
      }
    });
  }
  private getTableConfig(): any {
    return {
      data: this.dtprojectPartlistPriceRequest,
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
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      langs: {
        vi: {
          pagination: {
            first: '<<',
            last: '>>',
            prev: '<',
            next: '>',
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
        },
        { title: 'Deadline', field: 'Deadline', headerHozAlign: 'center' },
        {
          title: 'Ngày báo giá',
          field: 'DatePriceQuote',
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
          title: 'Lý do xoá',
          field: 'ReasonDeleted',
          headerHozAlign: 'center',
        },
      ],
    };
  }
}
