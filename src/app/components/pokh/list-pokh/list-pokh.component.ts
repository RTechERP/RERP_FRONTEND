import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { PokhServiceService } from '../pokh-service/pokh.service';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator, RowComponent } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerPartComponent } from '../../vision-base/customer-part/customer-part.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerPartService } from '../../vision-base/customer-part/customer-part/customer-part.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { end } from '@popperjs/core';

@Component({
  selector: 'app-list-pokh',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgbModule],
  templateUrl: './list-pokh.component.html',
  styleUrls: ['./list-pokh.component.css']
})
export class ListPokhComponent implements OnInit, AfterViewInit {
  constructor(private pokhService: PokhServiceService, private modalService: NgbModal, private customerPartService: CustomerPartService) { }

  @ViewChild('pokhTable', { static: false }) tableElement!: ElementRef;
  @ViewChild('productTable', { static: false }) productTableElement!: ElementRef;
  @ViewChild('fileTable', { static: false }) fileTableElement!: ElementRef;
  @ViewChild('ProductDetailTreeList', { static: false }) ProductDetailTreeListElement!: ElementRef;
  @ViewChild('DetailUser', { static: false }) DetailUserElement!: ElementRef;
  @ViewChild('fileUploaded', { static: false }) fileUploadedElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('pokhModal') pokhModal!: TemplateRef<any>;

  private table!: Tabulator;
  private productTable!: Tabulator;
  private fileTable!: Tabulator;
  private fileUploadedTable!: Tabulator;
  private ProductDetailTreeList!: Tabulator;
  private DetailUser!: Tabulator;
  private modalRef: any;

  deletedPOKHDetailIds: number[] = [];
  deletedDetailUserIds: number[] = [];
  deletedFileIds: number[] = [];
  isEditMode: boolean = false;
  lockEvents: boolean = false;
  pokhs: any[] = [];
  selectedProduct: any = null;
  detailUser: any[] = [];
  selectedRow: any = null;
  nextRowId: number = 0;
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
    customerName: '',
    userId: 0,
    poDate: new Date(),
    totalPO: 0,
    poNumber: '',
    projectId: 0,
    poType: 0,
    departmentId: 0,
    userType: 0,
    note: '',
    currencyId: 0,
    isBigAccount: false,
    isApproved: false,
    warehouseId: 1,
  };

  statusOptions = [
    { value: 0, label: 'Chưa giao, chưa thanh toán' },
    { value: 1, label: 'Đã giao, đã thanh toán' },
    { value: 2, label: 'Chưa giao, đã thanh toán' },
    { value: 3, label: 'Đã giao, nhưng chưa thanh toán' },
    { value: 4, label: 'Đã thanh toán, GH chưa xuất hóa đơn' },
    { value: 5, label: 'Giao một phần, đã thanh toán một phần' }
  ];

  ngOnInit(): void {
    const startDate = new Date('2025-02-10T12:00:00');
    const endDate = new Date();
    this.pokhService.getPOKH('', 1, 50, 0, 0, 0, 0, 0, startDate, endDate, 1, 0).subscribe((response) => { //warehouse = 1
      this.pokhs = response.data;
      console.log(this.pokhs);
      if (this.table) {
        this.table.setData(this.pokhs);
      }
      this.loadCustomers();
      this.loadEmployeeManagers();
      this.loadProjects();
      this.loadTypePO();
      this.loadCurrency();
      this.loadProducts();
    });

  }
  ngAfterViewInit(): void {
    this.initTable();
  }
  ////////////////////////////////////////////Data Loading Methods///////////////////////////////////////////////////////
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
  loadPOKHData(id: number): void {
    this.pokhService.getPOKHByID(id).subscribe(
      response => {
        if (response.status === 1) {
          const pokhData = response.data;
          const receivedDate = new Date(pokhData.ReceivedDatePO);

          // Format date to YYYY-MM-DD with local timezone
          const year = receivedDate.getFullYear();
          const month = String(receivedDate.getMonth() + 1).padStart(2, '0');
          const day = String(receivedDate.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;

          this.poFormData = {
            status: pokhData.Status,
            poCode: pokhData.POCode,
            customerId: pokhData.CustomerID,
            endUser: pokhData.EndUser,
            customerName: pokhData.CustomerName,
            userId: pokhData.UserID,
            poDate: formattedDate,
            totalPO: pokhData.TotalMoneyPO,
            poNumber: pokhData.PONumber,
            projectId: pokhData.ProjectID,
            poType: pokhData.POType,
            departmentId: pokhData.PartID || 0,
            userType: pokhData.UserType,
            note: pokhData.Note,
            currencyId: pokhData.CurrencyID,
            isBigAccount: pokhData.NewAccount,
            isApproved: pokhData.IsApproved,
            warehouseId: pokhData.WarehouseID,
          };

          this.selectedCustomer = this.customers.find(c => c.ID === pokhData.CustomerID);
          this.isResponsibleUsersEnabled = pokhData.UserType === 1;

          // Lấy dữ liệu bộ phận bằng khách hàng
          if (this.selectedCustomer) {
            this.loadPart(this.selectedCustomer.ID);
          }

          const POKHProducts$ = this.pokhService.getPOKHProduct(id, 0).pipe(
            map(res => (res.status === 1 ? this.convertToTreeData(res.data) : [])),
            catchError(err => {
              console.error('Lỗi tải POKHProduct:', err);
              return of([]);
            })
          );

          const POKHFiles$ = this.pokhService.getPOKHFile(id).pipe(
            map(res => (res.status === 1 ? res.data : [])),
            catchError(err => {
              console.error('Lỗi tải POKHFile:', err);
              return of([]);
            })
          );

          let detailUser$ = of([]);
          if (this.isResponsibleUsersEnabled) {
            detailUser$ = this.pokhService.loadUserDetail(id, 0).pipe(
              map(res => {
                if (res.status === 1) {
                  return res.data[1].map((detail: any) => {
                    const user = this.users.find(u => u.ID === detail.UserID);
                    return {
                      ...detail,
                      ID: detail.ID,
                      ResponsibleUser: user ? user.FullName : '',
                      UserID: user ? user.ID : detail.UserID,
                      PercentUser: detail.PercentUser ? detail.PercentUser * 100 : 0
                    };
                  });
                }
                return [];
              }),
              catchError(err => {
                console.error('Lỗi tải DetailUser:', err);
                return of([]);
              })
            );
          }

          // Sử dụng forkJoin để đợi tất cả các observables hoàn thành
          forkJoin([POKHProducts$, POKHFiles$, detailUser$]).subscribe(
            ([productsData, filesData, userDetailsData]) => {
              this.POKHProduct = productsData;


              this.uploadedFiles = filesData.map((fileFromServer: any) => ({
                ID: fileFromServer.ID,
                fileName: fileFromServer.OriginPath,
                fileType: this.getFileType(fileFromServer.OriginPath || ''),
                CreatedDate: fileFromServer.CreatedDate ? new Date(fileFromServer.CreatedDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
              }));
              this.detailUser = userDetailsData;


              this.initProductDetailTreeList();
              this.ProductDetailTreeList.setData(this.POKHProduct);

              this.initFileUploadedTable();
              this.fileUploadedTable?.setData(this.uploadedFiles);

              if (this.isResponsibleUsersEnabled) {
                this.initDetailTable();
                this.DetailUser?.setData(this.detailUser);
              } else {
                if (this.DetailUser) {
                  this.DetailUser.destroy();
                  this.isResponsibleUsersEnabled = false;
                  // this.DetailUser = undefined; 
                }
              }
            },
            forkJoinError => {
              console.error('Lỗi khi forkJoin tải dữ liệu chi tiết POKH:', forkJoinError);
              alert('Có lỗi xảy ra khi tải chi tiết POKH.');

              this.ProductDetailTreeList?.setData([]);
              this.fileUploadedTable?.setData([]);
              if (this.DetailUser) this.DetailUser.setData([]);
            }
          );
        } else {
          console.error('Lỗi khi tải dữ liệu POKH chính:', response.message);
          alert('Có lỗi xảy ra khi tải dữ liệu POKH.');
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải dữ liệu POKH chính:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu POKH.');
      }
    );
  }
  loadCustomers(): void {
    this.customerPartService.getCustomer().subscribe(
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
    this.customerPartService.getPart(id).subscribe(
      response => {
        if (response.status === 1) {
          this.parts = response.data[0];
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
          // Chuyển đổi dữ liệu phẳng thành cấu trúc cây
          const flatData = response.data;
          const treeData = this.convertToTreeData(flatData);
          this.POKHProduct = treeData;

          setTimeout(() => {
            this.initProductTable();
            console.log(this.POKHProduct);
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
  /////////////////////////////////////////END: Data Loading Methods//////////////////////////////////////////////

  ////////////////////////////////////////Event Handlers và Business Logic///////////////////////////////////////////////
  onCustomerChange(event: any): void {
    this.selectedCustomer = event

    this.loadPart(this.selectedCustomer.ID);
    console.log('Selected Customer ID:', this.selectedCustomer.ID);
    console.log('Selected Customer:', this.selectedCustomer);

    const customerShortName = this.selectedCustomer.CustomerShortName;
    this.generatePOCode(customerShortName);

    console.log('Customer Short Name:', customerShortName);
  }

  deleteFile(index: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa file này?')) {
      this.uploadedFiles.splice(index, 1);
      if (this.fileUploadedTable) {
        this.fileUploadedTable.setData(this.uploadedFiles);
      }
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      Array.from(files).forEach(file => {
        const fileObj = file as File;
        if (fileObj.size > MAX_FILE_SIZE) {
          alert(`File ${fileObj.name} vượt quá giới hạn dung lượng cho phép (50MB)`);
          return;
        }
        this.addFileToTable(fileObj);
      });
      this.fileInput.nativeElement.value = '';
    }
  }

  addFileToTable(file: File): void {
    const newFile = {
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      fileType: this.getFileType(file.name),
      uploadDate: new Date().toLocaleDateString('vi-VN'),
      file: file  // Lưu file gốc
    };
    this.uploadedFiles = [...this.uploadedFiles, newFile];
    if (this.fileUploadedTable) {
      this.fileUploadedTable.setData(this.uploadedFiles);
    }
  }

  getTotalPOValue(): number {
    this.calculateTotalIterative();
    return this.poFormData.totalPO;
  }

  onEdit(): void {
    if(this.selectedId > 0)
    {
      this.isEditMode = true;
      this.openModal();
    }
    else
    {
      alert("Vui lòng chọn một bản ghi cần sửa!");
    }
  }

  onDelete(): void {
    if (!this.selectedRow) {
      alert('Vui lòng chọn một PO cần xóa!');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa PO này ?')) {
      const pokhData = {
        ID: this.selectedRow['ID'],
        ...this.poFormData,
        IsDeleted: true
      };

      this.pokhService.handlePOKH({
        POKH: pokhData,
        pOKHDetails: [],
        pOKHDetailsMoney: []
      }).subscribe({
        next: (response) => {
          if (response.status === 1) {
            alert('Xóa PO thành công');
            this.loadData();
            this.selectedRow = null;
          } else {
            alert('Có lỗi xảy ra khi xóa PO');
          }
        },
        error: (error) => {
          console.error('Lỗi khi xóa PO:', error);
          alert('Có lỗi xảy ra khi xóa PO');
        }
      });
    }
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
    const intoMoney = quantity * unitPrice;
    const totalWithVAT = intoMoney + (intoMoney * (vat / 100));

    try {
      // Tính thành tiền và tổng tiền bao gồm VAT
      if (unitPrice >= 0 && quantity > 0) {
        if (columnField === 'Qty' || columnField === 'UnitPrice' || columnField === 'VAT') {
          row.update({
            IntoMoney: intoMoney,
            TotalPriceIncludeVAT: totalWithVAT
          });
          this.calculateTotalIterative();
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

      // Tính ngày thanh toán dựa trên ngày hóa đơn và số ngày công nợ
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
        this.calculateTotalIterative();
      }
    } catch (error) {
      console.error(error);
    }
  }
  calculateTotalIterative(): void {
    let totalSum = 0;
    const allRows = this.ProductDetailTreeList.getRows();

    allRows.forEach(row => {
      const rowData = row.getData();
      const stack = [rowData];

      while (stack.length > 0) {
        const currentNode = stack.pop();
        if (!currentNode) continue;

        if (currentNode["TotalPriceIncludeVAT"] !== undefined && !isNaN(currentNode["TotalPriceIncludeVAT"])) {
          totalSum += Number(currentNode["TotalPriceIncludeVAT"]);
        }

        if (currentNode["_children"] && currentNode["_children"].length > 0) {
          currentNode["_children"].forEach((child: any) => {
            stack.push(child);
          });
        }
      }
    });

    this.poFormData.totalPO = totalSum;
    console.log("Tổng giá trị sau VAT:", this.poFormData.totalPO);

    // Cập nhật lại giá trị tiền trong bảng người phụ trách
    this.updateResponsibleUsersMoney();
  }

  updateResponsibleUsersMoney(): void {
    if (!this.DetailUser) return;

    const totalPO = this.poFormData.totalPO;
    this.DetailUser.getRows().forEach(row => {
      const rowData = row.getData();
      if (rowData['ResponsibleUser']) {
        const percentValue = parseFloat(rowData['PercentUser']) || 0;
        const moneyValue = totalPO * (percentValue / 100);
        row.update({ MoneyUser: moneyValue });
      }
    });
  }

  calculateTotalMoneyKoVAT() {
    return this.ProductDetailTreeList.getData()
      .reduce((total, row) => total + (row.qty * row.unitPrice), 0);
  }

  onEnableChange() {
    if (!this.isResponsibleUsersEnabled) this.selectedProduct = null;
  }

  addNewRow(): void {
    this.nextRowId = this.nextRowId - 1;
    const newRow = {
      ID: this.nextRowId,
      ProductID: null,
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
      NetUnitPrice: 0,
      TotalPriceIncludeVAT: 0,
      UserReceiver: "",
      DeliveryRequestedDate: null,
      EstimatedPay: 0,
      BillDate: null,
      BillNumber: "",
      Debt: 0,
      KHID: 0,
      PayDate: null,
      GroupPO: "",
      ActualDeliveryDate: null,
      RecivedMoneyDate: null,
      ParentId: 0,
      IsDeleted: false,
      _children: []
    };

    this.POKHProduct.push(newRow);

    if (this.ProductDetailTreeList) {
      this.ProductDetailTreeList.addRow(newRow);
      this.ProductDetailTreeList.scrollToRow(newRow.ID, "bottom", true);
    }
  }
  addChildRow(): void {
    console.log("abc", this.selectedRow);

    if (!this.selectedRow) {
      alert("Vui lòng chọn một sản phẩm trước khi thêm sản phẩm con!");
      return;
    }
    this.nextRowId = this.nextRowId - 1;
    const parentData = this.selectedRow.getData();
    const childRow = {
      ID: this.nextRowId,
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
      NetUnitPrice: 0,
      TotalPriceIncludeVAT: 0,
      UserReceiver: "",
      DeliveryRequestedDate: null,
      EstimatedPay: 0,
      BillDate: null,
      BillNumber: "",
      Debt: 0,
      KHID: 0,
      PayDate: null,
      GroupPO: "",
      ActualDeliveryDate: null,
      RecivedMoneyDate: null,
      ParentId: parentData.ID,
      IsDeleted: false,
      _children: []
    };
    this.selectedRow.addTreeChild(childRow);
    this.selectedRow.treeExpand();
  }
  addRowDetailUser(): void {
    const newRow = {
      ResponsibleUser: "",
      PercentUser: 0,
      MoneyUser: 0,
    };
    this.detailUser = [...this.detailUser, newRow];
    if (this.DetailUser) {
      this.DetailUser.setData(this.detailUser);
    }
  }
  toggleResponsibleUsers() {
    this.isResponsibleUsersEnabled = !this.isResponsibleUsersEnabled;
    this.poFormData.userType = this.isResponsibleUsersEnabled ? 1 : 0;
    if (!this.isModalOpen) return;
    if (this.isResponsibleUsersEnabled) {
      if (this.selectedId > 0) {
        this.pokhService.loadUserDetail(this.selectedId, 0).subscribe(res => {
          if (res.status === 1) {
            this.detailUser = res.data[1].map((detail: any) => {
              const user = this.users.find(u => u.ID === detail.UserID);
              return {
                ...detail,
                ID: detail.ID,
                ResponsibleUser: user ? user.FullName : '',
                UserID: user ? user.ID : detail.UserID,
                PercentUser: detail.PercentUser ? detail.PercentUser * 100 : 0
              };
            });
            this.initDetailTable();
            this.DetailUser?.setData(this.detailUser);
          } else {
            this.detailUser = [];
            this.initDetailTable();
            this.DetailUser?.setData([]);
          }
        });
      } else {
        this.initDetailTable();
        this.DetailUser?.setData(this.detailUser);
      }
    } else {
      if (this.DetailUser) {
        this.DetailUser.destroy();
      }
      this.detailUser = [];
    }
  }
  /////////////////////////////////////////////////////////END: Event Handlers và Business Logic////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////Modal Management//////////////////////////////////////////////////////////
  isModalOpen: boolean = false;
  openModal() {
    this.isModalOpen = true;
    this.modalRef = this.modalService.open(this.pokhModal, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      windowClass: 'custom-modal'
    });

    setTimeout(() => {
      if (this.isEditMode) {
        this.loadPOKHData(this.selectedId); // Tải dữ liệu cho chế độ sửa
        this.ProductDetailTreeList?.setData(this.POKHProduct);
      } else {
        // Chế độ thêm mới
        this.resetForm(); // Reset form và dữ liệu
        this.POKHProduct = [];
        this.uploadedFiles = [];
        this.detailUser = [];
        this.isResponsibleUsersEnabled = false; // Mặc định tắt bảng người phụ trách

        this.initProductDetailTreeList(); // Khởi tạo với dữ liệu rỗng
        this.ProductDetailTreeList?.setData([]);

        this.initFileUploadedTable(); // Khởi tạo với dữ liệu rỗng
        this.fileUploadedTable?.setData([]);

        // Nếu bảng DetailUser đã tồn tại từ lần mở trước, hủy nó đi
        if (this.DetailUser) {
          this.DetailUser.destroy();
          this.isResponsibleUsersEnabled = false;
        }
      }
    }, 0);
  }
  openModalPOCode() {
    if (!this.selectedCustomer) {
      alert('Vui lòng chọn khách hàng trước!');
      return;
    }

    const modalRef = this.modalService.open(CustomerPartComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });

    modalRef.componentInstance.customerId = this.selectedCustomer.ID;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPart(this.selectedCustomer.ID);
        }
      },
      (reason) => {
        console.log('Modal dismissed');
      }
    );
  }
  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedId = 0;
    this.resetForm();
    if (this.ProductDetailTreeList) {
      this.ProductDetailTreeList.destroy();
    }
    if (this.DetailUser) {
      this.DetailUser.destroy();
      console.log(this.DetailUser.getData());
    }
    if (this.fileUploadedTable) {
      this.fileUploadedTable.destroy();
    }
  }
  ////////////////////////////////////////////////END: Modal Management////////////////////////////////////////////////////////

  ///////////////////////////////////////////////Form Management///////////////////////////////////////////////////////////
  resetForm() {
    this.poFormData = {
      status: 0,
      poCode: '',
      customerId: 0,
      endUser: '',
      customerName: '',
      userId: 0,
      poDate: new Date(),
      totalPO: 0,
      poNumber: '',
      projectId: 0,
      poType: 0,
      departmentId: 0,
      userType: 0,
      note: '',
      currencyId: 0,
      isBigAccount: false,
      isApproved: false,
      warehouseId: 1,
    };
    this.selectedCustomer = null;
    this.POKHProduct = [];
    this.detailUser = [];
    this.uploadedFiles = [];
  }
  validateForm(): boolean {
    if (this.poFormData.status < 0) {
      alert('Xin hãy chọn trạng thái.');
      return false;
    }
    if (!this.poFormData.poType) {
      alert('Xin hãy chọn loại PO.');
      return false;
    }
    if (!this.poFormData.poCode) {
      alert('Xin hãy nhập mã PO.');
      return false;
    }
    return true;
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
  //////////////////////////////////////////////////END: Form Management//////////////////////////////////////////////////////


  ///////////////////////////////////////////////////////Save Operations//////////////////////////////////////////////////
  savePOKH() {
    if (!this.validateForm()) return;
    const pokhData = this.getPOKHData();
    const details = this.ProductDetailTreeList.getData();
    const detailUsers = this.isResponsibleUsersEnabled && this.DetailUser ? 
      this.DetailUser.getData().map(user => ({
        ...user,
        RowHandle: (!user.RowHandle || Object.keys(user.RowHandle).length === 0) ? 0 : user.RowHandle,
        CreatedDate: (!user.CreatedDate || Object.keys(user.CreatedDate).length === 0) ? null : user.CreatedDate,
        STT: (!user.STT || Object.keys(user.STT).length === 0) ? 0 : user.STT,
        ReceiveMoney: (!user.ReceiveMoney || Object.keys(user.ReceiveMoney).length === 0) ? 0 : user.ReceiveMoney,
      })) : [];

    // Add deleted IDs to the request
    const deletedDetailUsers = this.deletedDetailUserIds.map(id => ({
      ID: id,
      IsDeleted: true
    }));

    const deletedPOKHDetails = this.deletedPOKHDetailIds.map(id => ({
      ID: id,
      IsDeleted: true
    }));

    console.log('POKH Data:', pokhData);
    console.log('Details:', details);
    console.log('Detail Users:', detailUsers);
    console.log('Deleted Detail Users:', deletedDetailUsers);

    if (!details || details.length === 0) {
      alert('Vui lòng thêm chi tiết sản phẩm');
      return;
    }

    // check ckType
    pokhData.UserType = this.isResponsibleUsersEnabled ? 1 : 0;

    const requestBody = {
      POKH: pokhData,
      pOKHDetails: [...this.getTreeRows(details), ...deletedPOKHDetails],
      pOKHDetailsMoney: [...detailUsers, ...deletedDetailUsers],

    };

    //api call
    this.pokhService.handlePOKH(requestBody).subscribe({
      next: (response) => {
        if (response.status === 1) {
          this.handleSuccess(response);
          this.deletedDetailUserIds = [];
          this.deletedPOKHDetailIds = [];
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }
  getPOKHData() {
    const poDate = new Date(this.poFormData.poDate || new Date());
    return {
      ID: this.selectedId || 0,
      Status: this.poFormData.status || 0,
      UserID: this.poFormData.userId || 0,
      POCode: this.poFormData.poCode || '',
      ReceivedDatePO: poDate,
      TotalMoneyPO: this.poFormData.totalPO || 0,
      TotalMoneyKoVAT: this.calculateTotalMoneyKoVAT(),
      Note: this.poFormData.note || '',
      IsApproved: this.poFormData.isApproved || false,
      CustomerID: this.selectedCustomer.ID || 0,
      PartID: this.poFormData.departmentId || 0,
      ProjectID: this.poFormData.projectId || 0,
      CustomerName: this.poFormData.customerName || '',
      POType: this.poFormData.poType || 0,
      NewAccount: this.poFormData.isBigAccount || false,
      EndUser: this.poFormData.endUser || '',
      IsBill: this.poFormData.isBill || false,
      UserType: this.poFormData.userType || 0,
      QuotationID: this.poFormData.quotationId || 0,
      PONumber: this.poFormData.poNumber || '',
      WarehouseID: this.poFormData.warehouseId || 0,
      CurrencyID: this.poFormData.currencyId || 0,
      Year: poDate.getFullYear(),
      Month: poDate.getMonth() + 1,
      IsDeleted: false
    };
  }
  getTreeRows(data: any[]): any[] {
    let dataTree: any[] = [];

    data.forEach((row) => {
      const processedRow = {
        ...row,
        KHID: (!row.KHID || Object.keys(row.KHID).length === 0) ? 0 : row.KHID,
        IndexPO: (!row.IndexPO || Object.keys(row.IndexPO).length === 0) ? null : row.IndexPO,
        RecivedMoneyDate: (!row.RecivedMoneyDate || Object.keys(row.RecivedMoneyDate).length === 0) ? null : row.RecivedMoneyDate,
        BillDate: (!row.BillDate || Object.keys(row.BillDate).length === 0) ? null : row.BillDate,
        ActualDeliveryDate: (!row.ActualDeliveryDate || Object.keys(row.ActualDeliveryDate).length === 0) ? null : row.ActualDeliveryDate,
        DeliveryRequestedDate: (!row.DeliveryRequestedDate || Object.keys(row.DeliveryRequestedDate).length === 0) ? null : row.DeliveryRequestedDate,
        PayDate: (!row.PayDate || Object.keys(row.PayDate).length === 0) ? null : row.PayDate,
        CreatedDate: (!row.CreatedDate || Object.keys(row.CreatedDate).length === 0) ? null : row.CreatedDate,
        UpdatedDate: (!row.UpdatedDate || Object.keys(row.UpdatedDate).length === 0) ? null : row.UpdatedDate,
        QuotationDetailID: 0,
        QtyTT: (!row.QtyTT || Object.keys(row.QtyTT).length === 0) ? 0 : row.QtyTT,
        QtyCL: (!row.QtyCL || Object.keys(row.QtyCL).length === 0) ? 0 : row.QtyCL,
        IsExport: (!row.IsExport || Object.keys(row.IsExport).length === 0) ? false : row.IsExport,
        QtyRequest: (!row.QtyRequest || Object.keys(row.QtyRequest).length === 0) ? 0 : row.QtyRequest,
        Note: (!row.Note || Object.keys(row.Note).length === 0) ? '' : row.Note,
        CurrencyID: (!row.CurrencyID || Object.keys(row.CurrencyID).length === 0) ? null : row.CurrencyID,
        TT: (!row.TT || Object.keys(row.TT).length === 0) ? '' : row.TT,
        ProjectPartListID: (!row.ProjectPartListID || Object.keys(row.ProjectPartListID).length === 0) ? 0 : row.ProjectPartListID,
        Spec: (!row.Spec || Object.keys(row.Spec).length === 0) ? '' : row.Spec,
        ReceiveMoney: (!row.ReceiveMoney || Object.keys(row.ReceiveMoney).length === 0) ? 0 : row.ReceiveMoney,
      };
      dataTree.push(processedRow);

      if (row._children && Array.isArray(row._children)) {
        dataTree = dataTree.concat(
          this.getTreeRows(row._children)
        );
      }
    });
    return dataTree;
  }
  handleSuccess(response: any) {
    const pokhId = response.data.id;
    if (this.uploadedFiles.length > 0 || this.deletedFileIds.length > 0) {
      this.uploadFiles(pokhId);
    }
    alert('Lưu thành công');
    this.loadData();
    this.closeModal();
  }
  handleError(error: any) {
    alert('Có lỗi xảy ra: ' + error.message);
  }
  uploadFiles(pokhId: number) {
    const formData = new FormData();

    // Thêm từng file vào FormData
    this.uploadedFiles.forEach(fileObj => {
      if (fileObj.file) {
        formData.append('files', fileObj.file);
      }
    });

    // Xử lý upload files mới
    if (this.uploadedFiles.length > 0) {
      this.pokhService.uploadFiles(formData, pokhId)
        .subscribe({
          next: (response) => {
            console.log('Upload files thành công');
          },
          error: (error) => {
            console.error('Lỗi upload files:', error);
          }
        });
    }

    // Xử lý xóa files
    if (this.deletedFileIds.length > 0) {
      this.pokhService.deleteFiles(this.deletedFileIds)
        .subscribe({
          next: (response) => {
            console.log('Xóa files thành công');
            this.deletedFileIds = [];
          },
          error: (error) => {
            console.error('Lỗi xóa files:', error);
          }
        });
    }
  }
  //////////////////////////////////////////////////////END: Save Operations/////////////////////////////////////////////////

  ////////////////////////////////////////TABLE//////////////////////////////////////////////////////////

  initTable(): void {
    if (!this.tableElement) return;
    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: this.pokhs,
      layout: 'fitDataFill',
      height: '50vh',
      selectableRows: 1,
      pagination: true,
      paginationSize: 20,
      movableColumns: true,
      resizableRows: true,
      reactiveData: true,
      columnDefaults: {
        headerWordWrap: true,
        headerVertical: false,
        headerHozAlign: "center",
        minWidth: 60,
        resizable: true
      },
      columns: [
        { title: 'Duyệt', field: 'IsApproved', sorter: 'boolean', width: 70, formatter: (cell) => `<input type="checkbox" ${cell.getValue() ? 'checked' : ''} disabled />` },
        { title: 'Trạng thái', field: 'StatusText', sorter: 'string', width: 150 },
        { title: 'Loại', field: 'MainIndex', sorter: 'string', width: 50 },
        { title: 'New Account', field: 'NewAccount', sorter: 'boolean', width: 85, formatter: (cell) => `<input type="checkbox" ${cell.getValue() ? 'checked' : ''} disabled />` },
        { title: 'Số POKH', field: 'ID', sorter: 'number', width: 70 },
        { title: 'Mã PO', field: 'POCode', sorter: 'string', width: 150 },
        { title: 'Khách hàng', field: 'CustomerName', sorter: 'string', width: 200 },
        { title: 'Người phụ trách', field: 'FullName', sorter: 'string', width: 150 },
        { title: 'Dự án', field: 'ProjectName', sorter: 'string', width: 200 },
        { title: 'Ngày nhận PO', field: 'ReceivedDatePO', sorter: 'date', width: 150, },
        { title: 'Loại tiền', field: 'CurrencyCode', sorter: 'string', width: 50 },
        { title: 'Tổng tiền Xuất VAT', field: 'TotalMoneyKoVAT', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tổng tiền nhận PO', field: 'TotalMoneyPO', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tiền về', field: 'ReceiveMoney', sorter: 'number', width: 150, formatter: 'money' },
        { title: 'Tình trạng tiến độ giao hàng', field: 'DeliveryStatusText', sorter: 'string', width: 150 },
        { title: 'Tình trạng xuất kho', field: 'ExportStatusText', sorter: 'string', width: 150 },
        { title: 'End User', field: 'EndUser', sorter: 'string', width: 150 },
        { title: 'Ghi chú', field: 'Note', sorter: 'string', width: 120 },
        { title: 'Công nợ', field: 'Debt', sorter: 'number', width: 120, formatter: 'money' },
        { title: 'Hóa đơn', field: 'ImportStatus', sorter: 'string', width: 150 },
        { title: 'Đặt hàng', field: 'PONumber', sorter: 'string', width: 150 }
      ]
    });

    this.table.on("rowDblClick", (e: UIEvent, row: RowComponent) => {
      const id = row.getData()['ID'];
      this.selectedId = id;
      this.onEdit();
    });
    this.table.on("rowClick", (e, row) => {
      const rowData = row.getData();
      this.selectedId = rowData['ID'];
      this.selectedRow = rowData;
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
      dataTreeStartExpanded: true,
      pagination: true,
      paginationSize: 10,
      height: '23vh',
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
      height: '23vh',
      movableColumns: true,
      resizableRows: true,
      columns: [
        {
          title: 'STT',
          formatter: "rownum",
          width: '10%',
          hozAlign: "center",
          headerSort: false
        },
        { title: 'Tên file', field: 'OriginPath', sorter: 'string', width: '90%' },
      ]
    });
  }
  initProductDetailTreeList(): void {
    if (!this.ProductDetailTreeListElement || !this.ProductDetailTreeListElement.nativeElement) return;
    if (this.ProductDetailTreeList) {
      this.ProductDetailTreeList.destroy();
    }
    this.ProductDetailTreeList = new Tabulator(this.ProductDetailTreeListElement.nativeElement, {
      data: this.POKHProduct,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: "_children",
      dataTreeChildIndent: 15,
      dataTreeElementColumn: "STT",
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 10,
      movableColumns: true,
      resizableRows: true,
      columns: [
        {
          title: '', field: 'actions', formatter: (cell) => {
            return `<i class="bi bi-trash3 text-danger delete-btn" style="font-size:15px; cursor: pointer;"></i>`;
          },
          width: '5%',
          hozAlign: "center",
          cellClick: (e, cell) => {
            if ((e.target as HTMLElement).classList.contains('delete-btn')) {
              if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                const row = cell.getRow();
                const rowData = row.getData();
                const parentRow = row.getTreeParent();
                
                // Get all IDs to be deleted (current row and all its children)
                this.deletedPOKHDetailIds = this.getAllRowIds(row);
                console.log("deletedPOKHDetailIds: ", this.deletedPOKHDetailIds);
                
                if (parentRow) {
                  // Nếu có node cha, xóa node con khỏi mảng _children của node cha
                  const parentData = parentRow.getData();
                  if (parentData['_children']) {
                    parentData['_children'] = parentData['_children'].filter((child: any) => child['ID'] !== rowData['ID']);
                    parentRow.update(parentData);
                  }
                } else {
                  // Nếu là node gốc, xóa khỏi mảng POKHProduct
                  this.POKHProduct = this.POKHProduct.filter(item => item['ID'] !== rowData['ID']);
                }
                
                // Cập nhật lại bảng
                this.ProductDetailTreeList.setData(this.POKHProduct);
                this.getTotalPOValue();
              }
            }
          }
        },
        { title: 'STT', field: 'STT', sorter: 'number', width: 70 },
        {
          title: 'Mã Nội Bộ', field: 'ProductNewCode', sorter: 'string', width: 120, editor: "list", editorParams: {
            values: this.Products.map(product => ({
              label: `${product.ProductNewCode}  - ${product.ProductCode} - ${product.ProductName}`,
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
        { title: 'Mã theo khách', field: 'GuestCode', sorter: 'string', width: 150, editor: "input" },
        { title: 'Hãng', field: 'Maker', sorter: 'string', width: 100, editor: "input" },
        { title: 'Số lượng', field: 'Qty', sorter: 'number', width: 80, editor: "number" },
        { title: 'Kích thước phim cắt/Model', field: 'FilmSize', sorter: 'string', width: 200, editor: "input" },
        { title: 'Thông số kỹ thuật', field: 'Spec', sorter: 'string', width: 150, editor: "input" },
        { title: 'ĐVT', field: 'Unit', sorter: 'string', width: 100, editor: "input" },
        {
          title: 'Đơn giá NET', field: 'NetUnitPrice', sorter: 'number', width: 150, editor: "number", formatter: "money",
          formatterParams: {
            precision: 0,
            decimal: ".",
            thousand: ",",
            symbol: "",
            symbolAfter: true
          }
        },
        {
          title: 'Đơn giá trước VAT', field: 'UnitPrice', sorter: 'number', width: 150, editor: "number", formatter: "money",
          formatterParams: {
            precision: 0,
            decimal: ".",
            thousand: ",",
            symbol: "",
            symbolAfter: true
          }
        },
        {
          title: 'Tổng tiền trước VAT', field: 'IntoMoney', sorter: 'number', width: 150, editor: "number", formatter: "money",
          formatterParams: {
            precision: 0,
            decimal: ".",
            thousand: ",",
            symbol: "",
            symbolAfter: true
          }
        },
        {
          title: 'VAT (%)',
          field: 'VAT',
          sorter: 'number',
          width: 100,
          editor: "number",
          formatter: function (cell, formatterParams, onRendered) {
            const value = cell.getValue();
            if (value !== null && value !== undefined && !isNaN(Number(value))) {
              return value + "%";
            }
            return "";
          }
        },
        {
          title: 'Tổng tiền sau VAT', field: 'TotalPriceIncludeVAT', sorter: 'number', width: 150, editor: "number", formatter: "money",
          formatterParams: {
            precision: 0,
            decimal: ".",
            thousand: ",",
            symbol: "",
            symbolAfter: true
          }
        },
        { title: 'Người nhận', field: 'UserReceiver', sorter: 'string', width: 130, editor: "input" },
        { title: 'Ngày yêu cầu giao hàng', field: 'DeliveryRequestedDate', sorter: 'string', width: 200, formatter: this.dateFormatter, editor: "date" },
        { title: 'Thanh toán dự kiến', field: 'EstimatedPay', sorter: 'number', width: 150, editor: "number" },
        { title: 'Ngày hóa đơn', field: 'BillDate', sorter: 'string', width: 150, formatter: this.dateFormatter, editor: "date" },
        { title: 'Số hóa đơn', field: 'BillNumber', sorter: 'string', width: 150, editor: "input" },
        { title: 'Công nợ', field: 'Debt', sorter: 'number', width: 150, editor: "number" },
        { title: 'Ngày yêu cầu thanh toán', field: 'PayDate', sorter: 'string', width: 150, formatter: this.dateFormatter, editor: "date" },
        { title: 'Nhóm', field: 'ProductPO', sorter: 'string', width: 100, editor: "input" },
        { title: 'Ghi chú', field: 'Note', sorter: 'string', width: 100, editor: "input" }
      ]
    });
    (window as any).deleteTreeRow = (index: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này')) {
        this.POKHProduct.splice(index, 1);
        this.ProductDetailTreeList?.setData(this.POKHProduct);
      }
    };

    this.ProductDetailTreeList.on("cellEdited", (cell) => {
      if (cell.getColumn().getField() === "ProductNewCode") {
        const selectedProduct = this.Products.find(p => p.ProductNewCode === cell.getValue());
        console.log("Dữ liệu của sản phẩm đã nhận: ", selectedProduct)
        if (selectedProduct) {
          const row = cell.getRow();
          row.update({
            productId: selectedProduct.ID,
            ProductCode: selectedProduct.ProductCode,
            ProductName: selectedProduct.ProductName,
            Unit: selectedProduct.Unit,
            Maker: selectedProduct.Maker,
            ProductGroupName: selectedProduct.ProductGroupName
          });
          console.log("rowEdited: ", row);
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
  initDetailTable(): void {
    if (!this.DetailUserElement || !this.DetailUserElement.nativeElement) return;
    if (this.DetailUser) {
      this.DetailUser.destroy();
    }
    this.DetailUser = new Tabulator(this.DetailUserElement.nativeElement, {
      data: this.detailUser,
      layout: "fitDataFill",
      pagination: true,
      paginationSize: 5,
      movableColumns: true,
      resizableRows: true,
      reactiveData: true,
      columns: [
        {
          title: '', field: 'actions', formatter: (cell) => {
            return `<i class="bi bi-trash3 text-danger delete-btn" style="font-size:15px; cursor: pointer;"></i>`;
          },
          width: '5%',
          hozAlign: "center",
          cellClick: (e, cell) => {
            if ((e.target as HTMLElement).classList.contains('delete-btn')) {
              if (confirm('Bạn có chắc chắn muốn xóa người phụ trách này?')) {
                const row = cell.getRow();
                const rowData = row.getData();
                
                // thêm id của người phụ trách đã xóa vào mảng deletedDetailUserIds
                if (rowData['ID']) {
                  this.deletedDetailUserIds.push(rowData['ID']);
                }
                
                row.delete();
                this.detailUser = this.DetailUser.getData();
              }
            }
          }
        },
        {
          title: 'ID',
          field: 'ID',
          sorter: 'number',
          visible: false,
        },
        {
          title: 'UserID',
          field: 'UserID',
          sorter: 'number',
          visible: false,
        },
        {
          title: 'Người phụ trách',
          field: 'ResponsibleUser',
          sorter: 'string',
          width: '25%',
          editor: "list",
          editorParams: {
            values: this.users.map(user => ({
              label: `${user.FullName}`,
              value: user.FullName,
              id: user.ID 
            })),
            listOnEmpty: true,
            autocomplete: true
          },
          cellEdited: (cell) => {
            const selectedUser = this.users.find(user => user.FullName === cell.getValue());
            if (selectedUser) {
              const currentRow = cell.getRow();
              currentRow.update({ UserID: selectedUser.ID });
            }
          }
        },
        {
          title: 'Phần trăm', field: 'PercentUser', sorter: 'number', editor: "input", width: '30%',
          cellEdited: (cell) => {
            const totalPO = this.getTotalPOValue();
            const percentValue = parseFloat(cell.getValue()) || 0;

            // Tính tổng phần trăm hiện tại
            let totalPercent = 0;
            this.DetailUser.getRows().forEach(row => {
              const rowData = row.getData();
              if (rowData['ResponsibleUser']) { // Chỉ tính cho các dòng có người phụ trách
                totalPercent += parseFloat(rowData['PercentUser']) || 0;
              }
            });

            // Kiểm tra nếu tổng phần trăm vượt quá 100%
            if (totalPercent > 100) {
              alert('Tổng phần trăm không được vượt quá 100%');
              cell.setValue(0);
              cell.getRow().update({ MoneyUser: 0 });
              return;
            }

            const moneyValue = totalPO * (percentValue / 100);
            cell.getRow().update({ MoneyUser: moneyValue });
          },
          formatter: function (cell, formatterParams, onRendered) {
            const value = cell.getValue();
            if (value === null || value === undefined || value === '') {
              return '';
            }
            return Number(value) + '%';
          }
        },
        {
          title: 'Tiền theo phần trăm',
          field: 'MoneyUser',
          sorter: 'number',
          editor: "input",
          width: '40%',
          formatter: function (cell, formatterParams, onRendered) {
            const value = cell.getValue();
            if (value === null || value === undefined || value === '') {
              return '';
            }
            return new Intl.NumberFormat('vi-VN').format(value);
          }
        },
      ]
    });
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
      paginationSize: 10,
      height: '30vh',
      movableColumns: true,
      resizableRows: true,
      reactiveData: true,
      columns: [
        {
          title: 'Hành động',
          field: 'actions',
          formatter: (cell) => {
            return `<i class="bi bi-trash3 text-danger delete-btn" style="font-size:15px; cursor: pointer;"></i>`;
          },
          width: "10%",
          hozAlign: "center",
          cellClick: (e, cell) => {
            if ((e.target as HTMLElement).classList.contains('delete-btn')) {
              if (confirm('Bạn có chắc chắn muốn xóa file này?')) {
                const row = cell.getRow();
                const rowData = row.getData();
                
                // thêm id của file đã xóa vào mảng deletedFileIds
                if (rowData['ID']) {
                  this.deletedFileIds.push(rowData['ID']);
                }
                
                row.delete();
                this.uploadedFiles = this.fileUploadedTable.getData();
              }
            }
          }
        },
        { title: 'Tên file', field: 'fileName', sorter: 'string', width: "60%" },
        { title: 'Loại file', field: 'fileType', sorter: 'string', width: "10%" },
        { title: 'Ngày tải lên', field: 'CreatedDate', sorter: 'date', width: "30%" }
      ]
    });

    (window as any).deleteFile = (index: number) => {
      this.deleteFile(index);
    };
  }
  ////////////////////////////////////////////END: Table/////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////Utility Methods////////////////////////////////////////////////////
  dateFormatter = (cell: any) => {
    const value = cell.getValue();
    if (!value || typeof value !== 'string') return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
  };

  getFileType(fileName: string): string {
    return fileName.split('.').pop()?.toUpperCase() || '';
  }
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Hàm chuyển đổi dữ liệu phẳng thành cấu trúc cây
  private convertToTreeData(flatData: any[]): any[] {
    const treeData: any[] = [];
    const map = new Map();

    // Đầu tiên, tạo map với key là ID của mỗi item
    flatData.forEach(item => {
      map.set(item.ID, { ...item, _children: [] });
    });

    // Sau đó, xây dựng cấu trúc cây
    flatData.forEach(item => {
      const node = map.get(item.ID);
      if (item.ParentID === 0) {
        // Nếu là node gốc (không có parent)
        treeData.push(node);
      } else {
        // Nếu là node con, thêm vào mảng _children của parent
        const parent = map.get(item.ParentID);
        if (parent) {
          parent._children.push(node);
        }
      }
    });

    return treeData;
  }

  private getAllRowIds(row: any): number[] {
    const ids: number[] = [];
    const rowData = row.getData();
    
    if (rowData.ID) {
      ids.push(rowData.ID);
    }
    
    if (rowData._children && rowData._children.length > 0) {
      rowData._children.forEach((child: any) => {
        const childRow = {
          getData: () => child
        };
        ids.push(...this.getAllRowIds(childRow));
      });
    }
    
    return ids;
  }
  ////////////////////////////////////////////////END: Utility Methods/////////////////////////////////////////////////
}