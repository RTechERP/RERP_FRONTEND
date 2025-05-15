import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PokhServiceService } from '../pokh-service/pokh.service';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { event } from 'jquery';



@Component({
  selector: 'app-list-pokh',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './list-pokh.component.html',
  styleUrls: ['./list-pokh.component.css']
})
export class ListPokhComponent implements OnInit, AfterViewInit {
  @ViewChild('pokhTable', { static: false }) tableElement!: ElementRef;
  @ViewChild('productTable', { static: false }) productTableElement!: ElementRef;
  @ViewChild('fileTable', { static: false }) fileTableElement!: ElementRef;
  @ViewChild('ProductDetailTreeList', { static: false }) ProductDetailTreeListElement!: ElementRef;
  private table!: Tabulator;
  private productTable!: Tabulator;
  private fileTable!: Tabulator;
  private ProductDetailTreeList!: Tabulator;
  pokhs: any[] = [];
  selectedProduct: any = null;
  selectedRow: any = null;
  nextRowId: number = 1;
  selectedId: number = 0;
  Products: any[] = [];
  selectedCustomer: any = null;
  selectedCustomerId: number = 0;
  isResponsibleUsersEnabled = false;
  availableUsers: any[] = [];
  customers: any[] = [];
  users: any[] = [];
  projects: any[] = [];
  poTypes: any[] = [];
  parts: any[] = [];
  currencies: any[] = [];
  POKHProduct: any[] = [];
  POKHFiles: any[] = [];
  poFormData: any = {
    status: 0,
    poCode: '',
    customerId: 0,
    endUser: '',
    userId: 0,
    poDate: new Date(),
    totalPO: 0,
    poNumber: '',
    projectId: 0,
    poType: 0,
    departmentId: 0,
    note: '',
    currencyId: 0,
    isBigAccount: false
  };
  constructor(private pokhService: PokhServiceService) { }

  ngOnInit(): void {
    const startDate = new Date('2025-02-10T12:00:00');
    this.pokhService.getPOKH('', 1, 50, 0, 0, 0, 0, 0, startDate, new Date(), 1, 0).subscribe((response) => {
      this.pokhs = response.data;
      console.log(this.pokhs);
      if (this.table) {
        this.table.setData(this.pokhs);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initTable();
  }

  initTable(): void {
    if (!this.tableElement) return;
    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: this.pokhs,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 10,
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'Hành động', field: 'actions', formatter: this.actionFormatter, width: 120 },
        { title: 'Duyệt', field: 'IsApproved', sorter: 'boolean', width: 80, formatter: (cell) => `<input type="checkbox" ${cell.getValue() ? 'checked' : ''} disabled />` },
        { title: 'Trạng thái', field: 'StatusText', sorter: 'string', width: 200 },
        { title: 'Loại', field: 'MainIndex', sorter: 'string', width: 100 },
        { title: 'Loại Account', field: 'AccountTypeText', sorter: 'string', width: 150 },
        { title: 'Số POKH', field: 'ID', sorter: 'number', width: 80 },
        { title: 'Mã PO', field: 'POCode', sorter: 'string', width: 150 },
        { title: 'Khách hàng', field: 'CustomerName', sorter: 'string', width: 200 },
        { title: 'Người phụ trách', field: 'FullName', sorter: 'string', width: 150 },
        { title: 'Dự án', field: 'ProjectName', sorter: 'string', width: 200 },
        { title: 'Ngày nhận PO', field: 'ReceivedDatePO', sorter: 'date', width: 150, formatter: 'datetime' },
        { title: 'Loại tiền', field: 'CurrencyCode', sorter: 'string', width: 100 },
        { title: 'Tổng tiền Xuất VAT', field: 'TotalMoneyKoVAT', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tổng tiền nhận PO', field: 'TotalMoneyPO', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tiền về', field: 'ReceiveMoney', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tình trạng tiến độ giao hàng', field: 'DeliveryStatusText', sorter: 'string', width: 150 },
        { title: 'Tình trạng xuất kho', field: 'ExportStatusText', sorter: 'string', width: 150 },
        { title: 'End User', field: 'EndUser', sorter: 'string', width: 150 },
        { title: 'Ghi chú', field: 'Note', sorter: 'string', width: 200 },
        { title: 'Công nợ', field: 'Debt', sorter: 'number', width: 120, formatter: 'money' },
        { title: 'Hóa đơn', field: 'BillCode', sorter: 'string', width: 150 },
        { title: 'Đặt hàng', field: 'PONumber', sorter: 'string', width: 150 }
      ]
    });
    this.table.on("rowClick", (e, row) => {
      const rowData = row.getData();
      this.selectedId = rowData['ID'];
      this.loadPOKHProducts(this.selectedId);
      this.loadPOKHFiles(this.selectedId);
    });
  }

  initProductTable(): void {
    if (!this.productTableElement || !this.productTableElement.nativeElement) return;

    if (this.productTable) {
      this.productTable.destroy();
    }

    this.productTable = new Tabulator(this.productTableElement.nativeElement, {
      data: this.POKHProduct,
      dataTree: true,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 5,
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'STT', field: 'STT', sorter: 'number', width: 70 },
        { title: 'Mã Nội Bộ', field: 'ProductNewCode', sorter: 'string', width: 120 },
        { title: 'Mã Sản Phẩm (Cũ)', field: 'ProductCode', sorter: 'string', width: 120 },
        { title: 'Tên sản phẩm', field: 'ProductName', sorter: 'string', width: 250 },
        { title: 'Mã theo khách', field: 'GuestCode', sorter: 'string', width: 250 },
        { title: 'Hãng', field: 'Maker', sorter: 'string', width: 250 },
        { title: 'Số lượng', field: 'Qty', sorter: 'number', width: 250 },
        { title: 'Kích thước phim cắt/Model', field: 'FilmSize', sorter: 'string', width: 250 },
        { title: 'ĐVT', field: 'Unit', sorter: 'string', width: 250 },
        { title: 'Đơn giá trước VAT', field: 'UnitPrice', sorter: 'number', width: 250 },
        { title: 'Tổng tiền trước VAT', field: 'IntoMoney', sorter: 'number', width: 250 },
        { title: 'VAT (%)', field: 'VAT', sorter: 'number', width: 250 },
        { title: 'Tổng tiền sau VAT', field: 'TotalPriceIncludeVAT', sorter: 'number', width: 250 },
        { title: 'Người nhận', field: 'UserReceiver', sorter: 'string', width: 250 },
        { title: 'Ngày yêu cầu giao hàng', field: 'DeliveryRequestedDate', sorter: 'string', width: 250, formatter: this.dateFormatter },
        { title: 'Thanh toán dự kiến', field: 'EstimatedPay', sorter: 'number', width: 250 },
        { title: 'Ngày hóa đơn', field: 'BillDate', sorter: 'string', width: 250, formatter: this.dateFormatter },
        { title: 'Số hóa đơn', field: 'BillNumber', sorter: 'string', width: 250 },
        { title: 'Công nợ', field: 'Debt', sorter: 'number', width: 250 },
        { title: 'Ngày yêu cầu thanh toán', field: 'PayDate', sorter: 'string', width: 250, formatter: this.dateFormatter },
        { title: 'Nhóm', field: 'GroupPO', sorter: 'string', width: 250 },
        { title: 'Ngày giao hàng thực tế', field: 'ActualDeliveryDate', sorter: 'string', width: 250, formatter: this.dateFormatter },
        { title: 'Ngày tiền về', field: 'RecivedMoneyDate', sorter: 'string', width: 250, formatter: this.dateFormatter },
        { title: 'SL đã về', field: 'QuantityReturn', sorter: 'number', width: 250 },
        { title: 'SL đã xuất', field: 'QuantityExport', sorter: 'number', width: 250 },
        { title: 'SL còn lại', field: 'QuantityRemain', sorter: 'number', width: 250 },
      ]
    });
  }
  initFileTable(): void {
    if (!this.fileTableElement || !this.fileTableElement.nativeElement) return;

    if (this.fileTable) {
      this.fileTable.destroy();
    }

    this.fileTable = new Tabulator(this.fileTableElement.nativeElement, {
      data: this.POKHFiles,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 5,
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'Tên file', field: 'FileName', sorter: 'string', width: 373 },
      ]
    });
  }
  dateFormatter = (cell: any) => {
    const value = cell.getValue();
    if (!value || typeof value !== 'string') return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
  };

  actionFormatter(cell: any): any {
    const id = cell.getRow().getData().ID;
    return `
    <button style="background-color: #007bff; color: white; border: none; padding: 5px 10px; margin-right: 5px; cursor: pointer;" 
            (click)="onEdit(${id})">Sửa</button>
    <button style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer;" 
            (click)="onDelete(${id})">Xóa</button>
  `;
  }
  onDelete(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa không?')) { }
  }
  loadFormData(): void {
    this.loadCustomers();
    this.loadEmployeeManagers();
    this.loadProjects();
    this.loadTypePO();
    this.loadCurrency();
    this.loadProducts();
    console.log(this.Products);
  }

  isModalOpen: boolean = false;
  openModal() {
    this.isModalOpen = true;
    this.loadFormData();
    this.initProductDetailTreeList();
  }
  closeModal() {
    this.isModalOpen = false;
  }
  onEnableChange() {
    if (!this.isResponsibleUsersEnabled) this.selectedProduct = null;
  }
  loadCustomers(): void {
    this.pokhService.getCustomer().subscribe(
      response => {
        if (response.status === 1) {
          this.customers = response.data;
        } else {
          console.error('Lỗi khi tải khách hàng:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải khách hàng:', error);
      }
    );
  }
  loadEmployeeManagers(): void {
    this.pokhService.loadEmployeeManagers().subscribe(
      response => {
        if (response.status === 1) {
          // this.users = response.data[0] || [];
          this.users = response.data || [];
        } else {
          console.error('Lỗi khi tải nhân viên quản lý:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải nhân viên quản lý:', error);
      }
    );
  }
  loadProjects(): void {
    this.pokhService.loadProject().subscribe(
      response => {
        if (response.status === 1) {

          this.projects = response.data;
        } else {
          console.error('Lỗi khi tải dự án:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải dự án:', error);
      }
    );
  }
  loadTypePO(): void {
    this.pokhService.getTypePO().subscribe(
      response => {
        if (response.status === 1) {
          this.poTypes = response.data;
        } else {
          console.error('Lỗi khi tải loại PO:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải loại PO:', error);
      }
    );
  }
  loadPart(id: number): void {
    this.pokhService.getPart(id).subscribe(
      response => {
        if (response.status === 1) {
          this.parts = response.data;
        } else {
          console.error('Lỗi khi tải phòng ban:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải phòng ban:', error);
      }
    );
  }
  loadCurrency(): void {
    this.pokhService.getCurrency().subscribe(
      response => {
        if (response.status === 1) {
          this.currencies = response.data;
        } else {
          console.error('Lỗi khi tải loại tiền:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải loại tiền:', error);
      }
    );
  }
  loadPOKHProducts(id: number = 0, idDetail: number = 0): void {
    this.pokhService.getPOKHProduct(id, idDetail).subscribe(
      response => {
        if (response.status === 1) {
          this.POKHProduct = response.data;
          setTimeout(() => {
            this.initProductTable();
          }, 0);
        } else {
          console.error('Lỗi khi tải chi tiết POKH:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải chi tiết POKH:', error);
      }
    );
  }
  loadPOKHFiles(id: number = 0): void {
    this.pokhService.getPOKHFile(id).subscribe(
      response => {
        if (response.status === 1) {
          this.POKHFiles = response.data;
          setTimeout(() => {
            this.initFileTable();
          }, 0);
        } else {
          console.error('Lỗi khi tải tệp POKH:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải tệp POKH:', error);
      }
    );
  }
  onCustomerChange(event: any): void {
    this.selectedCustomer = event

    this.loadPart(this.selectedCustomer.ID);
    console.log('Selected Customer ID:', this.selectedCustomer.ID);
    console.log('Selected Customer:', this.selectedCustomer);

    const customerShortName = this.selectedCustomer.CustomerShortName;
    this.generatePOCode(customerShortName);

    console.log('Customer Short Name:', customerShortName);
  }

  generatePOCode(CustomerName: string): void {
    const { isCopy = false, warehouseId = 1, pokhId = 0 } = this.poFormData;

    console.log('Gọi generatePOCode với:', {
      CustomerName,
      isCopy,
      warehouseId,
      pokhId
    });

    this.pokhService.generatePOCode(CustomerName, isCopy, warehouseId, pokhId).subscribe(
      response => {
        if (response.status === 1) {
          console.log('Mã PO được tạo:', response.data);
          this.poFormData.poCode = response.data;

        } else {
          console.error('Lỗi khi tạo mã PO:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tạo mã PO:', error);
      }
    );
  }
  loadProducts(): void {
    this.pokhService.loadProducts().subscribe(
      response => {
        if (response.status === 1) {
          this.Products = response.data;
        } else {
          console.error('Lỗi khi tải sản phẩm:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải sản phẩm:', error);
      }
    );
  }

  initProductDetailTreeList(): void {
    if (!this.ProductDetailTreeListElement || !this.ProductDetailTreeListElement.nativeElement) return;
    if (this.ProductDetailTreeList) {
      this.ProductDetailTreeList.destroy();
    }
    this.ProductDetailTreeList = new Tabulator(this.ProductDetailTreeListElement.nativeElement, {
      data: this.POKHProduct,
      dataTree: true,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 5,
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'STT', field: 'STT', sorter: 'number', width: 70 },
        { title: 'Mã Nội Bộ', field: 'ProductNewCode', sorter: 'string', width: 120, editor: "input" },
        { title: 'Mã Sản Phẩm (Cũ)', field: 'ProductCode', sorter: 'string', width: 120, editor: "input" },
        { title: 'Tên sản phẩm', field: 'ProductName', sorter: 'string', width: 250, editor: "input" },
        { title: 'Mã theo khách', field: 'GuestCode', sorter: 'string', width: 250, editor: "input" },
        { title: 'Hãng', field: 'Maker', sorter: 'string', width: 250, editor: "input" },
        { title: 'Số lượng', field: 'Qty', sorter: 'number', width: 250, editor: "number" },
        { title: 'Kích thước phim cắt/Model', field: 'FilmSize', sorter: 'string', width: 250, editor: "input" },
        { title: 'ĐVT', field: 'Unit', sorter: 'string', width: 250, editor: "input" },
        { title: 'Đơn giá trước VAT', field: 'UnitPrice', sorter: 'number', width: 250, editor: "number" },
        { title: 'Tổng tiền trước VAT', field: 'IntoMoney', sorter: 'number', width: 250, editor: "number" },
        { title: 'VAT (%)', field: 'VAT', sorter: 'number', width: 250, editor: "number" },
        { title: 'Tổng tiền sau VAT', field: 'TotalPriceIncludeVAT', sorter: 'number', width: 250, editor: "number" },
        { title: 'Người nhận', field: 'UserReceiver', sorter: 'string', width: 250, editor: "input" },
        { title: 'Ngày yêu cầu giao hàng', field: 'DeliveryRequestedDate', sorter: 'string', width: 250, formatter: this.dateFormatter, editor: "date" },
        { title: 'Thanh toán dự kiến', field: 'EstimatedPay', sorter: 'number', width: 250, editor: "number" },
        { title: 'Ngày hóa đơn', field: 'BillDate', sorter: 'string', width: 250, formatter: this.dateFormatter, editor: "date" },
        { title: 'Số hóa đơn', field: 'BillNumber', sorter: 'string', width: 250, editor: "input" },
        { title: 'Công nợ', field: 'Debt', sorter: 'number', width: 250, editor: "number" },
        { title: 'Ngày yêu cầu thanh toán', field: 'PayDate', sorter: 'string', width: 250, formatter: this.dateFormatter, editor: "date" },
        { title: 'Nhóm', field: 'GroupPO', sorter: 'string', width: 250, editor: "input" },
        { title: 'Ngày giao hàng thực tế', field: 'ActualDeliveryDate', sorter: 'string', width: 250, formatter: this.dateFormatter, editor: "date" },
        { title: 'Ngày tiền về', field: 'RecivedMoneyDate', sorter: 'string', width: 250, formatter: this.dateFormatter, editor: "date" },
        { title: 'SL đã về', field: 'QuantityReturn', sorter: 'number', width: 250, editor: "number" },
        { title: 'SL đã xuất', field: 'QuantityExport', sorter: 'number', width: 250, editor: "number" },
        { title: 'SL còn lại', field: 'QuantityRemain', sorter: 'number', width: 250, editor: "number" },
      ]
    });

    this.ProductDetailTreeList.on("rowClick", (e, row) => {
      this.selectedRow = row;
    });
  }

  addNewRow(): void {
    const newRow = {
      id: "new_" + this.nextRowId++,
      STT: this.POKHProduct.length + 1,
      ProductNewCode: "",
      ProductCode: "",
      ProductName: "",
      GuestCode: "",
      Maker: "",
      Qty: 0,
      FilmSize: "",
      Unit: "",
      UnitPrice: 0,
      IntoMoney: 0,
      VAT: 0,
      TotalPriceIncludeVAT: 0,
      UserReceiver: "",
      DeliveryRequestedDate: null,
      EstimatedPay: 0,
      BillDate: null,
      BillNumber: "",
      Debt: 0,
      PayDate: null,
      GroupPO: "",
      ActualDeliveryDate: null,
      RecivedMoneyDate: null,
      QuantityReturn: 0,
      QuantityExport: 0,
      QuantityRemain: 0,
      _children: []
    };

    this.POKHProduct.push(newRow);

    if (this.ProductDetailTreeList) {
      this.ProductDetailTreeList.addRow(newRow);
      this.ProductDetailTreeList.scrollToRow(newRow.id, "bottom", true);
    }
  }
  addChildRow(): void {
    if (!this.selectedRow) {
      alert("Vui lòng chọn một sản phẩm trước khi thêm sản phẩm con!");
      return;
    }

    const childRow = {
      id: "child_" + this.nextRowId++,
      STT: this.selectedRow.getData()._children ? this.selectedRow.getData()._children.length + 1 : 1,
      ProductNewCode: "",
      ProductCode: "",
      ProductName: "",
      GuestCode: "",
      Maker: "",
      Qty: 0,
      FilmSize: "",
      Unit: "",
      UnitPrice: 0,
      IntoMoney: 0,
      VAT: 0,
      TotalPriceIncludeVAT: 0,
      UserReceiver: "",
      DeliveryRequestedDate: null,
      EstimatedPay: 0,
      BillDate: null,
      BillNumber: "",
      Debt: 0,
      PayDate: null,
      GroupPO: "",
      ActualDeliveryDate: null,
      RecivedMoneyDate: null,
      QuantityReturn: 0,
      QuantityExport: 0,
      QuantityRemain: 0
    };

    this.ProductDetailTreeList.addRow(childRow, false, this.selectedRow);

    this.selectedRow.treeExpand();

    this.ProductDetailTreeList.scrollToRow(childRow.id, "bottom", true);
  }
}