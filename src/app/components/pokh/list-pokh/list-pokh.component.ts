import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, viewChild } from '@angular/core';
import { PokhServiceService } from '../pokh-service/pokh.service';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { error, event } from 'jquery';
import { CustomerPartComponent } from '../../vision-base/customer-part/customer-part.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-pokh',
  imports: [CommonModule, FormsModule, NgSelectModule, CustomerPartComponent],
  templateUrl: './list-pokh.component.html',
  styleUrls: ['./list-pokh.component.css']
})
export class ListPokhComponent implements OnInit, AfterViewInit {
  @ViewChild('pokhTable', { static: false }) tableElement!: ElementRef;
  @ViewChild('productTable', { static: false }) productTableElement!: ElementRef;
  @ViewChild('fileTable', { static: false }) fileTableElement!: ElementRef;
  @ViewChild('ProductDetailTreeList', { static: false }) ProductDetailTreeListElement!: ElementRef;
  @ViewChild('DetailUser', { static: false }) DetailUserElement!: ElementRef;
  @ViewChild('fileUploaded', { static: false }) fileUploadedElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  private table!: Tabulator;
  private productTable!: Tabulator;
  private fileTable!: Tabulator;
  private fileUploadedTable!: Tabulator;
  private ProductDetailTreeList!: Tabulator;
  private DetailUser!: Tabulator;

  lockEvents: boolean = false;
  pokhs: any[] = [];
  selectedProduct: any = null;
  detailUser: any[] = [];
  selectedRow: any = null;
  nextRowId: number = 1;
  selectedId: number = 0;
  Products: any[] = [];
  uploadedFiles: any[] = [];
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
  constructor(private pokhService: PokhServiceService, private modalService: NgbModal) { }

  ngOnInit(): void {
    const startDate = new Date('2025-02-10T12:00:00');
    this.pokhService.getPOKH('', 1, 50, 0, 0, 0, 0, 0, startDate, new Date(), 1, 0).subscribe((response) => { //warehouse = 1
      this.pokhs = response.data;
      console.log(this.pokhs);
      if (this.table) {
        this.table.setData(this.pokhs);
      }
      this.loadFormData();
    });
  }

  ngAfterViewInit(): void {
    this.initTable();
  }
  openModalPOCode() { 
     const modalRef = this.modalService.open(CustomerPartComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      
    });
  }
  //SAVE
  savePOKH() {
    const pokhData = this.getPOKHData();
    const details = this.getPOKHDetails();

    console.log('POKH Data:', pokhData);
    console.log('Details:', details);
    if (!details || details.length === 0) {
      alert('Vui lòng thêm chi tiết sản phẩm');
      return;
    }
    const requestBody = {
      POKH: pokhData,
      pOKHDetails: details
    };
    console.log('Request Body:', requestBody);
    //api call
    this.pokhService.handlePOKH(requestBody).subscribe({
      next: (response) => {
        if (response.status === 1) {
          this.handleSuccess(response)
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    })
  }
  getPOKHData() {
    const poDate = new Date(this.poFormData.poDate || new Date());
    return {
      status: this.poFormData.status || 0,
      userId: this.poFormData.userId || 0,
      poCode: this.poFormData.poCode || '',
      receivedDatePO: poDate,
      totalMoneyPO: this.poFormData.totalPO || 0,
      totalMoneyKoVAT: this.calculateTotalMoneyKoVAT(),
      note: this.poFormData.note || '',
      customerId: this.poFormData.customerId || 0,
      partId: this.poFormData.partId || 0,
      projectId: this.poFormData.projectId || 0,
      poType: this.poFormData.poType || 0,
      newAccount: this.poFormData.isBigAccount || false,
      endUser: this.poFormData.endUser || '',
      isBill: this.poFormData.isBill || false,
      userType: this.poFormData.userType || 0,
      quotationId: this.poFormData.quotationId || 0,
      poNumber: this.poFormData.poNumber || '',
      warehouseId: this.poFormData.warehouseId || 0,
      currencyId: this.poFormData.currencyId || 0,
      year: poDate.getFullYear(),
      month: poDate.getMonth() + 1
    };
  }

  getPOKHDetails() {
    if (!this.ProductDetailTreeList) {
      console.error('ProductDetailTreeList chưa được khởi tạo');
      return [];
    }

    const treeData = this.ProductDetailTreeList.getData();
    console.log('Raw Tree Data:', treeData);

    if (!treeData || treeData.length === 0) {
      console.warn('Không có dữ liệu chi tiết sản phẩm');
      return [];
    }

    const processRows = (rows: any[], parentId: number | null = null, level: number = 0): any[] => {
      if (!rows || !Array.isArray(rows)) return [];

      let result: any[] = [];

      rows.forEach((row, index) => {
        if (!row) return;

        console.log(`Processing row level ${level}, index ${index}:`, row);

        const rowData = {
          ProductId: row.productId || (row.id ? Number(row.id) : null),
          Qty: row.Qty ? Number(row.Qty) : 0,
          UnitPrice: row.UnitPrice ? Number(row.UnitPrice) : 0,
          IntoMoney: (row.Qty ? Number(row.Qty) : 0) * (row.UnitPrice ? Number(row.UnitPrice) : 0),
          FilmSize: row.FilmSize || null,
          Vat: row.VAT ? Number(row.VAT) : 0,
          BillNumber: row.BillNumber || null,
          BillDate: row.BillDate ? new Date(row.BillDate) : null,
          TotalPriceIncludeVAT: row.TotalPriceIncludeVAT ? Number(row.TotalPriceIncludeVAT) : 0,
          DeliveryRequestedDate: row.DeliveryRequestedDate ? new Date(row.DeliveryRequestedDate) : null,
          PayDate: row.PayDate ? new Date(row.PayDate) : null,
          EstimatedPay: row.EstimatedPay ? Number(row.EstimatedPay) : 0,
          QuotationDetailId: row.quotationDetailId ? Number(row.quotationDetailId) : null,
          GuestCode: row.GuestCode || null,
          Debt: row.Debt ? Number(row.Debt) : 0,
          UserReceiver: row.UserReceiver || null,
          Note: row.Note || null,
          NetUnitPrice: row.netUnitPrice ? Number(row.netUnitPrice) : 0,
          ProjectPartListId: row.projectPartListId ? Number(row.projectPartListId) : null,
          Spec: row.Spec || null,
          ParentId: parentId,
          Stt: index + 1
        };

        result.push(rowData);

        // Xử lý các sản phẩm con nếu có
        if (row._children && Array.isArray(row._children) && row._children.length > 0) {
          const childRows = processRows(row._children, rowData.ProductId, level + 1);
          result = result.concat(childRows);
        }
      });

      return result;
    };

    return processRows(treeData);
  }

  calculateTotalMoneyKoVAT() {
    return this.ProductDetailTreeList.getData()
      .reduce((total, row) => total + (row.qty * row.unitPrice), 0);
  }
  handleSuccess(response: any) {
    const pokhId = response.data.id;
    if (this.uploadedFiles.length > 0) {
      this.uploadFiles(pokhId);
    }
    alert('Lưu thành công');
    this.loadData();
    this.closeModal();
  }
  uploadFiles(pokhId: number) {
    this.pokhService.uploadFiles(this.uploadedFiles, pokhId)
      .subscribe({
        next: (response) => {
          console.log('Upload files thành công');
        },
        error: (error) => {
          console.error('Lỗi upload files:', error);
        }
      });
  }
  handleError(error: any) {
    alert('Có lỗi xảy ra: ' + error.message);
  }

  loadData() {
    const startDate = new Date('2025-02-10T12:00:00');
    this.pokhService.getPOKH('', 1, 50, 0, 0, 0, 0, 0, startDate, new Date(), 1, 0)
      .subscribe((response) => {
        this.pokhs = response.data;
        if (this.table) {
          this.table.setData(this.pokhs);
        }
      });
  }
  //END SAVE
  initTable(): void {
    if (!this.tableElement) return;
    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: this.pokhs,
      layout: 'fitDataFill',
      height: '50vh',
      pagination: true,
      paginationSize: 20,
      movableColumns: true,
      resizableRows: true,
      reactiveData: true,
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
        { title: 'Ngày nhận PO', field: 'ReceivedDatePO', sorter: 'date', width: 150, },
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
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 3,
      height: '18vh',
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'STT', field: 'STT', sorter: 'number', width: 70 },
        {
          title: 'Mã Nội Bộ', field: 'ProductNewCode', sorter: 'string', width: 120
        },
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
      paginationSize: 3,
      height: '18vh',
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
    this.loadDetailUser();
  }

  isModalOpen: boolean = false;
  openModal() {
    this.isModalOpen = true;
    setTimeout(() => {
      this.initProductDetailTreeList();
      this.initFileUploadedTable();
    }, 300);
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
          this.users = response.data[2] || [];
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
          console.log("Files:", this.POKHFiles)
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
      dataTree: true,
      dataTreeStartExpanded: false,
      dataTreeChildField: "_children",
      dataTreeChildIndent: 15,
      dataTreeElementColumn: "STT",
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 10,
      movableColumns: true,
      resizableRows: true,
      columns: [
        { title: 'STT', field: 'STT', sorter: 'number', width: 70 },
        {
          title: 'Mã Nội Bộ', field: 'ProductNewCode', sorter: 'string', width: 120, editor: "list", editorParams: {
            values: this.Products.map(product => ({
              label: `${product.ProductNewCode}  - ${product.ProductCode} - ${product.ProductName} - ${product.Unit} - ${product.ProductGroupName}`,
              value: product.ProductNewCode,
              id: product.ID
            })),
            listOnEmpty: true,
            autocomplete: true,
            freetext: true,
          },
        },
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
        { title: 'Nhóm', field: 'ProductPO', sorter: 'string', width: 250, editor: "input" },
        { title: 'Ghi chú', field: 'Note', sorter: 'string', width: 250, editor: "input" }
      ]
    });

    this.ProductDetailTreeList.on("cellEdited", (cell) => {
      if (cell.getColumn().getField() === "ProductNewCode") {
        const selectedProduct = this.Products.find(p => p.ProductNewCode === cell.getValue());
        console.log("Dữ liệu của sản phẩm đã nhận: ", selectedProduct)
        if (selectedProduct) {
          const row = cell.getRow();
          row.update({
            ProductCode: selectedProduct.ProductCode,
            ProductName: selectedProduct.ProductName,
            Unit: selectedProduct.Unit,
            ProductGroupName: selectedProduct.ProductGroupName
          });
        }
      }
      this.handleCellValueChange(cell);
    });

    this.ProductDetailTreeList.on("rowClick", (e, row) => {
      this.selectedRow = row;
      console.log("selectedRow", this.selectedRow);
      console.log("_children: ", this.selectedRow.getData()['_children']);

    });
  }
  handleCellValueChange(cell: any): void {
    if (this.lockEvents) return;

    const row = cell.getRow();
    const columnField = cell.getColumn().getField();
    const rowData = row.getData();

    const quantity = row.getData().Qty || 0;
    const unitPrice = row.getData().UnitPrice || 0;
    const vat = row.getData().VAT || 0;
    const billDate = row.getData().BillDate;
    const debt = row.getData().Debt || 0;

    try {
      // Tính thành tiền
      if (unitPrice >= 0 && quantity > 0) {
        if (columnField === 'Qty' || columnField === 'UnitPrice' || columnField === 'VAT') {
          const intoMoney = quantity * unitPrice;
          row.update({
            IntoMoney: intoMoney,
            TotalPriceIncludeVAT: intoMoney + (intoMoney * (vat / 100))
          });
          this.calculateTotal();
        }
      }

      // Xử lý VAT
      if (columnField === 'VAT') {
        this.ProductDetailTreeList.getRows().forEach(item => {
          const itemData = item.getData();
          const vatOld = itemData["VAT"] || 0;
          const vatOldText = String(itemData["VAT"]);

          if (vatOld === 0 && vat !== 0 && vatOldText === '') {
            item.update({ VAT: vat });
          }
        });
      }

      // Tính ngày thanh toán
      if (columnField === 'BillDate' || columnField === 'Debt') {
        if (billDate) {
          const payDate = new Date(billDate);
          payDate.setDate(payDate.getDate() + debt);
          row.update({ PayDate: payDate });
        }
      }

      // Tính lại thành tiền khi thay đổi số lượng hoặc đơn giá
      if (columnField === 'Qty' || columnField === 'UnitPrice') {
        row.update({ IntoMoney: quantity * unitPrice });
        this.calculateTotal();
      }
    } catch (error) {
      console.error(error);
    }
  }

  calculateTotal(): void {
    let totalSum = 0;
    const allRows = this.ProductDetailTreeList.getRows();
    allRows.forEach(row => {
      const rowData = row.getData();
      // Kiểm tra nếu giá trị không phải là undefined và là số
      if (rowData["TotalPriceIncludeVAT"] !== undefined && !isNaN(rowData["TotalPriceIncludeVAT"])) {
        totalSum += Number(rowData["TotalPriceIncludeVAT"]);
      }
    });
    this.poFormData.totalPO = totalSum;
    console.log("Tổng giá trị sau VAT:", this.poFormData.totalPO);
  };

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
    console.log("abc", this.selectedRow);

    if (!this.selectedRow) {
      alert("Vui lòng chọn một sản phẩm trước khi thêm sản phẩm con!");
      return;
    }
    const childRow = {
      id: "child_" + this.nextRowId++,
      STT: this.selectedRow.getData()['_children'] ? this.selectedRow.getData()['_children'].length + 1 : 1,
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
    this.selectedRow.addTreeChild(childRow);

    this.selectedRow.treeExpand();

  }
  loadDetailUser(id: number = 0, idDetail: number = 0): void {
    this.pokhService.loadUserDetail(id, idDetail).subscribe(
      response => {
        if (response.status === 1) {
          this.detailUser = response.data;
        }
        else {
          console.error('Lỗi khi tải chi tiết người dùng:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải chi tiết người dùng:', error);
      }
    );
  }
  initDetailTable(): void {
    if (!this.DetailUserElement || !this.DetailUserElement.nativeElement) return;
    if (this.DetailUser) {
      this.DetailUser.destroy();
    }
    this.DetailUser = new Tabulator(this.DetailUserElement.nativeElement, {
      layout: "fitDataFill",
      pagination: true,
      paginationSize: 5,
      movableColumns: true,
      resizableRows: true,
      columns: [
        {
          title: '', field: 'actions', formatter: (cell, formatterParams) => {
            return `<i class="bi bi-trash3 text-danger" style="font-size:15px" onclick="deleteRow(${cell.getRow().getIndex()})"></i>`;
          },
          width: '5%'
        },
        {
          title: 'Người phụ trách', field: 'ResponsibleUser', sorter: 'string', width: '35%', editor: "list", editorParams: {
            values: this.users.map(user => ({
              label: `${user.FullName}`,
              value: user.FullName,
              id: user.ID
            })),
            listOnEmpty: true,
            autocomplete: true
          },
        },
        { title: 'Phần trăm', field: 'PercentUser', sorter: 'number', editor: "input", width: '30%',
          cellEdited: (cell) => {
            const totalPO = this.getTotalPOValue();
            const percentValue = parseFloat(cell.getValue()) || 0;
            const moneyValue = totalPO * (percentValue / 100);
            cell.getRow().update({MoneyUser: moneyValue});
          }
        },
        { title: 'Tiền theo phần trăm', field: 'MoneyUser', sorter: 'number', editor: "input", width: '30%' },
      ]
    });
  }
  
  getTotalPOValue(): number {
    this.calculateTotal();
    return this.poFormData.totalPO;
  }

  addRowDetailUser(): void {
    const newRow = {
      id: "new_" + this.nextRowId++,
      ResponsibleUser: "",
      PercentUser: 0,
      MoneyUser: 0,
    };
    this.detailUser.push(newRow);
    if (this.DetailUser) {
      this.DetailUser.addRow(newRow);
      this.DetailUser.scrollToRow(newRow.id, "bottom", true);
    }
  }
  toggleResponsibleUsers() {
    this.isResponsibleUsersEnabled = !this.isResponsibleUsersEnabled;
    if (this.isResponsibleUsersEnabled) {
      this.initDetailTable();
    } else {
      this.DetailUser.destroy();
    }
  }
  initFileUploadedTable(): void {
    if (!this.fileUploadedElement || !this.fileUploadedElement.nativeElement) return;

    if (this.fileUploadedTable) {
      this.fileUploadedTable.destroy();
    }

    this.fileUploadedTable = new Tabulator(this.fileUploadedElement.nativeElement, {
      data: this.uploadedFiles,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 5,
      height: '30vh',
      movableColumns: true,
      resizableRows: true,
      columns: [
        {
          title: 'Hành động',
          field: 'actions',
          formatter: (cell) => {
            return `<button class="btn btn-sm btn-danger"><i class="bi bi-trash"></i></button>`;
          },
          width: "10%",
          hozAlign: "center",
        },
        { title: 'Tên file', field: 'fileName', sorter: 'string', width: "60%" },
        { title: 'Kích thước', field: 'fileSize', sorter: 'string', width: "10%" },
        { title: 'Loại file', field: 'fileType', sorter: 'string', width: "10%" },
        { title: 'Ngày tải lên', field: 'uploadDate', sorter: 'date', width: "10%" }
      ]
    });
  }
  onUploadClick() {
    if (!this.fileInput || !this.fileInput.nativeElement) {
      console.error('File input element not found');
      return;
    }

    const files = this.fileInput.nativeElement.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        this.addFileToTable(file as File);
        console.log(this.uploadedFiles);
      });
      this.fileInput.nativeElement.value = '';
    }
  }

  addFileToTable(file: File): void {
    const newFile = {
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      fileType: this.getFileType(file.name),
      uploadDate: new Date().toLocaleDateString('vi-VN')
    };
    this.uploadedFiles.push(newFile);
    if (this.fileUploadedTable) {
      this.fileUploadedTable.addRow(newFile);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileType(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || '';
  }


}