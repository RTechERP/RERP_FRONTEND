import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CustomerServiceService } from '../customer-service/customer-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CustomerSpecializationFormComponent } from '../customer-specialization-form/customer-specialization-form.component';
import * as ExcelJS from 'exceljs';
import * as moment from 'moment';

interface Provinces {
  STT: number;
  Name: string;
  Code: string;
}


@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    CustomerSpecializationFormComponent
  ]
})
export class CustomerFormComponent implements OnInit, AfterViewInit {

  private tabulator!: Tabulator;
  private tabulatorContacts!: Tabulator;
  private tabulatorEmployeeSale!: Tabulator;
  private tabulatorAddress!: Tabulator;
  private tabulatorContactsCreate!: Tabulator;
  private tabulatorAddressCreate!: Tabulator;
  private tabulatorEmployeeSaleCreate!: Tabulator;
  constructor(
    private customerService: CustomerServiceService,
  ) { }

  customers: any[] = [];
  customerContacts: any[] = [];
  employeeSales: any[] = [];
  address: any[] = [];
  teamList: any[] = [];
  employeeList: any[] = [];
  businessField: any[] = [];
  major: any[] = [];
  searchTeam: number = 0;
  searchEmployee: number = 0;
  searchKeyword: string = '';
  selectedBusinessField: number = 0;
  selectedMajor: number = 0;
  toastMessage: string = '';
  selectedCustomerId: number = 0;
  isSuccess: boolean = false;
  isEditMode: boolean = false;
  selectedCustomer: any = null;
  customersToExcel: any[] = [];

  // Dữ liệu tạm cho 3 bảng nhập liệu khi tạo khách hàng
  customerContactsCreate: any[] = [];
  addressesCreate: any[] = [];
  employeeSalesCreate: any[] = [];

  // Add customer model
  customer = {
    ID: 0,
    Province: '',
    CodeProvinces: '',
    CustomerCode: '',
    CustomerShortName: '',
    TaxCode: '',
    CustomerType: '',
    BigAccount: false,
    CustomerName: '',
    Address: '',
    BusinessFieldID: null,
    CustomerSpecializationID: null,
    ProductDetails: '',
    Debt: '',
    NoteDelivery: '',
    NoteVoucher: '',
    ClosingDateDebt: new Date().toISOString().split('T')[0],
    HardCopyVoucher: '',
    CheckVoucher: '',
    IsDeleted: false
  };

  // Dữ liệu nhập liệu cho bảng liên hệ
  newContacts: any[] = [];
  newContact = {
    ContactName: '',
    CustomerPart: '',
    CustomerPosition: '',
    CustomerTeam: '',
    ContactPhone: '',
    ContactEmail: ''
  };

  provinces: Provinces[] = [
    { STT: 1, Name: 'Hà Nội', Code: 'HN' },
    { STT: 2, Name: 'Hồ Chí Minh', Code: 'HCM' },
    { STT: 3, Name: 'Đà Nẵng', Code: 'DN' },
    { STT: 4, Name: 'Hải Phòng', Code: 'HP' },
    { STT: 5, Name: 'Cần Thơ', Code: 'CT' },
    { STT: 6, Name: 'An Giang', Code: 'AG' },
    { STT: 7, Name: 'Bà Rịa - Vũng Tàu', Code: 'BR-VT' },
    { STT: 8, Name: 'Bắc Giang', Code: 'BG' },
    { STT: 9, Name: 'Bắc Kạn', Code: 'BK' },
    { STT: 10, Name: 'Bạc Liêu', Code: 'BL' },
    { STT: 11, Name: 'Bắc Ninh', Code: 'BN' },
    { STT: 12, Name: 'Bến Tre', Code: 'BT' },
    { STT: 13, Name: 'Bình Định', Code: 'BD' },
    { STT: 14, Name: 'Bình Dương', Code: 'BD' },
    { STT: 15, Name: 'Bình Phước', Code: 'BP' },
    { STT: 16, Name: 'Bình Thuận', Code: 'BT' },
    { STT: 17, Name: 'Cà Mau', Code: 'CM' },
    { STT: 18, Name: 'Cao Bằng', Code: 'CB' },
    { STT: 19, Name: 'Đắk Lắk', Code: 'DL' },
    { STT: 20, Name: 'Đắk Nông', Code: 'DN' },
    { STT: 21, Name: 'Điện Biên', Code: 'DB' },
    { STT: 22, Name: 'Đồng Nai', Code: 'DN' },
    { STT: 23, Name: 'Đồng Tháp', Code: 'DT' },
    { STT: 24, Name: 'Gia Lai', Code: 'GL' },
    { STT: 25, Name: 'Hà Giang', Code: 'HG' },
    { STT: 26, Name: 'Hà Nam', Code: 'HN' },
    { STT: 27, Name: 'Hà Tĩnh', Code: 'HT' },
    { STT: 28, Name: 'Hải Dương', Code: 'HD' },
    { STT: 29, Name: 'Hậu Giang', Code: 'HG' },
    { STT: 30, Name: 'Hòa Bình', Code: 'HB' },
    { STT: 31, Name: 'Hưng Yên', Code: 'HY' },
    { STT: 32, Name: 'Khánh Hòa', Code: 'KH' },
    { STT: 33, Name: 'Kiên Giang', Code: 'KG' },
    { STT: 34, Name: 'Kon Tum', Code: 'KT' },
    { STT: 35, Name: 'Lai Châu', Code: 'LC' },
    { STT: 36, Name: 'Lâm Đồng', Code: 'LD' },
    { STT: 37, Name: 'Lạng Sơn', Code: 'LS' },
    { STT: 38, Name: 'Lào Cai', Code: 'LC' },
    { STT: 39, Name: 'Long An', Code: 'LA' },
    { STT: 40, Name: 'Nam Định', Code: 'ND' },
    { STT: 41, Name: 'Nghệ An', Code: 'NA' },
    { STT: 42, Name: 'Ninh Bình', Code: 'NB' },
    { STT: 43, Name: 'Ninh Thuận', Code: 'NT' },
    { STT: 44, Name: 'Phú Thọ', Code: 'PT' },
    { STT: 45, Name: 'Phú Yên', Code: 'PY' },
    { STT: 46, Name: 'Quảng Bình', Code: 'QB' },
    { STT: 47, Name: 'Quảng Nam', Code: 'QN' },
    { STT: 48, Name: 'Quảng Ngãi', Code: 'QN' },
    { STT: 49, Name: 'Quảng Ninh', Code: 'QN' },
    { STT: 50, Name: 'Quảng Trị', Code: 'QT' },
    { STT: 51, Name: 'Sóc Trăng', Code: 'ST' },
    { STT: 52, Name: 'Sơn La', Code: 'SL' },
    { STT: 53, Name: 'Tây Ninh', Code: 'TN' },
    { STT: 54, Name: 'Thái Bình', Code: 'TB' },
    { STT: 55, Name: 'Thái Nguyên', Code: 'TN' },
    { STT: 56, Name: 'Thanh Hóa', Code: 'TH' },
    { STT: 57, Name: 'Thừa Thiên Huế', Code: 'TTH' },
    { STT: 58, Name: 'Tiền Giang', Code: 'TG' },
    { STT: 59, Name: 'Trà Vinh', Code: 'TV' },
    { STT: 60, Name: 'Tuyên Quang', Code: 'TQ' },
    { STT: 61, Name: 'Vĩnh Long', Code: 'VL' },
    { STT: 62, Name: 'Vĩnh Phúc', Code: 'VP' },
    { STT: 63, Name: 'Yên Bái', Code: 'YB' }
  ];

  selectedProvince: Provinces | null = null;

  addContact() {
    if (this.newContact.ContactName || this.newContact.ContactPhone || this.newContact.ContactEmail) {
      this.newContacts.push({ ...this.newContact });
      this.newContact = {
        ContactName: '',
        CustomerPart: '',
        CustomerPosition: '',
        CustomerTeam: '',
        ContactPhone: '',
        ContactEmail: ''
      };
    }
  }
  removeContact(index: number) {
    this.newContacts.splice(index, 1);
  }

  // Dữ liệu nhập liệu cho bảng địa chỉ giao hàng
  newAddresses: any[] = [];
  newAddress = { Address: '' };
  addAddress() {
    if (this.newAddress.Address) {
      this.newAddresses.push({ ...this.newAddress });
      this.newAddress = { Address: '' };
    }
  }
  removeAddress(index: number) {
    this.newAddresses.splice(index, 1);
  }

  // Dữ liệu nhập liệu cho bảng nhân viên sale
  newEmployeeSales: any[] = [];
  newEmployeeSale = { EmployeeName: '' };
  addEmployeeSale() {
    if (this.newEmployeeSale.EmployeeName) {
      this.newEmployeeSales.push({ ...this.newEmployeeSale });
      this.newEmployeeSale = { EmployeeName: '' };
    }
  }
  removeEmployeeSale(index: number) {
    this.newEmployeeSales.splice(index, 1);
  }



  ngOnInit() {
    this.loadCustomers();
    this.loadCustomersToExcel();
    this.initializeTabulator();
    this.initializeTabulatorContacts();
    this.initializeTabulatorEmployeeSale();
    this.initializeTabulatorAddress();
    this.loadTeams();
    this.loadEmployees();
    this.loadBusinessField();
    this.loadMajor();
    this.initializeTabulatorContactsCreate();
    this.initializeTabulatorAddressCreate();
    this.initializeTabulatorEmployeeSaleCreate();
  }

  onSearch() {
    this.customerService.filterCustomer(this.searchTeam, this.searchEmployee, this.searchKeyword || '').subscribe({
      next: (data) => {
        this.customers = Array.isArray(data.data) ? data.data : [data.data];
        this.initializeTabulator();
      },
      error: (error) => {
        console.error('Error searching customers:', error);
      }
    });
  }

  resetSearch() {
    this.searchTeam = 0;
    this.searchEmployee = 0;
    this.searchKeyword = '';
    this.loadCustomers();
  }

  // Hàm lấy danh sách khách hàng
  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        console.log(data.data);
        this.customers = Array.isArray(data.data) ? data.data : [data.data];
        console.log(this.customers);
        this.initializeTabulator();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  loadCustomersToExcel() {
    this.customerService.getCustomersToExcel().subscribe({
      next: (data) => {
        this.customersToExcel = Array.isArray(data.data) ? data.data : [data.data];
      },
      error: (error) => {
        console.error('Error loading customers for Excel:', error);
      }
    });
  }

  // Hàm lấy danh sách liên hệ khách hàng
  loadCustomerContacts(customerId:number){
    this.customerService.getCustomerContacts(customerId).subscribe({
      next: (data) => {
        this.customerContacts = Array.isArray(data.data) ? data.data : [data.data];
        console.log(this.customerContacts)
        this.initializeTabulatorContacts();
        // Update create table if in edit mode
        if (this.isEditMode) {
          this.tabulatorContactsCreate.setData(this.customerContacts);
        }
      },
      error: (error) => {
        console.error('Error loading customer contacts:', error);
        this.showNotification('Lỗi khi tải thông tin liên hệ: ' + error.message, false);
      }
    });
  }

  // Hàm lấy danh sách nhân viên sale theo khách hàng
  loadCustomerEmployeeSale(customerId:number){
    this.customerService.getCustomerEmployeeSale(customerId).subscribe({
      next: (data) => {
        if (data.data && Array.isArray(data.data)) {
          this.employeeSales = data.data.map((sale: any) => ({
            ID: sale.ID,
            EmployeeID: sale.EmployeeID,
            EmployeeName: sale.EmployeeName
          }));
        } else {
          this.employeeSales = [];
        }
        this.initializeTabulatorEmployeeSale();
        // Update create table if in edit mode
        if (this.isEditMode && this.employeeSales.length > 0) {
          this.tabulatorEmployeeSaleCreate.setData(this.employeeSales);
        }
      },
      error: (error) => {
        console.error('Error loading customer employee sale:', error);
        this.showNotification('Lỗi khi tải thông tin nhân viên sale: ' + error.message, false);
      }
    });
  }

  // Hàm lấy danh sách team 
  loadTeams() {
    this.customerService.getTeams().subscribe((data: any) => {
      this.teamList = data.data;
    });
  }

  // Hàm lấy danh sách nhân viên sale
  loadEmployees() {
    this.customerService.getEmployees().subscribe({
      next: (data: any) => {
        this.employeeList = data.data;
        // Update employee list in tabulator if it exists
        if (this.tabulatorEmployeeSaleCreate) {
          this.tabulatorEmployeeSaleCreate.setColumns([
            {
              title: ' + ',
              field: 'addRow',
              headerSort: false,
              width: 40,
              hozAlign: 'center',
              headerHozAlign: 'center',
              headerFormatter: function() {
                return "<i class='fas fa-plus-circle text-primary' style='cursor:pointer;font-size:1.2rem;' title='Thêm dòng'></i>";
              },
              headerClick: (e: any, column: any) => {
                this.addEmployeeSaleRow();
              }
            } as any,
            { 
              title: 'Tên nhân viên',
              field: 'EmployeeName',
              editor: 'list',
              editorParams: {
                values: this.employeeList.map((employee: any) => ({
                  value: employee.ID,
                  label: employee.FullName
                })),
                searchable: true,
                autocomplete: true,
              },
              formatter: (cell) => {
                const value = cell.getValue();
                const employee = this.employeeList.find((emp: any) => emp.ID === value);
                return employee ? employee.FullName : value;
              },
              hozAlign: 'center',
              headerHozAlign: 'center'
            },
            { 
              title: '', 
              formatter: 'buttonCross', 
              width: 40, 
              hozAlign: 'center', 
              cellClick: (e, cell) => {
                cell.getRow().delete();
              }
            }
          ]);
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.showNotification('Lỗi khi tải danh sách nhân viên: ' + error.message, false);
      }
    });
  }

  loadBusinessField(){
    this.customerService.getBusinessField().subscribe((data: any) => {
      this.businessField = data.data;
    });
  }
  // Hàm lấy danh sách ngành nghề
  loadMajor(){
    this.customerService.getCustomerSpecialization().subscribe((data: any) => {
      this.major = data.data;
    });
  }

  // Hàm khởi tạo bảng khách hàng
  private initializeTabulator(): void {
    this.tabulator = new Tabulator('#customer-table', {
      data: this.customers,
      selectableRows: 1,  
      layout: 'fitDataFill',
      height: '50vh',
      columns: [
        { title: 'Mã khách hàng', field: 'CustomerCode', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Tên kí hiệu', field: 'CustomerShortName', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Tên khách hàng', field: 'CustomerName', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Địa chỉ', field: 'Address', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Mã số thuế', field: 'TaxCode', hozAlign: 'left', headerHozAlign: 'center' },
        { 
          title: 'Loại hình', 
          field: 'CustomerType', 
          hozAlign: 'left', 
          headerHozAlign: 'center',
          formatter: (cell) => {
            const value = cell.getValue();
            switch(value) {
              case 0: return '';
              case 1: return 'SL';
              case 2: return 'Thương mại';
              case 3: return 'Sản xuất';
              case 4: return 'Chế tạo máy';
              case 5: return 'Cá nhân';
              default: return value;
            }
          }
        },
        { title: 'Lưu ý giao hàng', field: 'NoteDelivery', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Lưu ý chứng từ', field: 'NoteVoucher', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Đầu mối gửi check chứng từ', field: 'CheckVoucher', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Đầu mối gửi chứng từ bản cứng', field: 'HardCopyVoucher', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Ngày chốt công nợ', field: 'ClosingDateDebt', hozAlign: 'center', headerHozAlign: 'center', 
          formatter: (cell) => {
            return cell.getValue() ? moment.default(cell.getValue()).format('DD/MM/YYYY') : '';
          }
        },
        { title: 'Công nợ', field: 'Debt', hozAlign: 'center', headerHozAlign: 'center' },
        { title: 'Địa chỉ giao hàng', field: 'AddressStock', hozAlign: 'left', headerHozAlign: 'center' },
      ],
      pagination: true,
      paginationSize: 20,
      paginationSizeSelector: [5, 10, 20, 50]
    });

    this.tabulator.on("rowSelectionChanged", (data: any) => {
      const customerId = data[0].ID;
      this.loadCustomerContacts(customerId);
      this.loadCustomerEmployeeSale(customerId);
      this.loadCustomerAddress(customerId);
    });
  }

  // Hàm khởi tạo bảng liên hệ khách hàng
  private initializeTabulatorContacts(): void {
    this.tabulatorContacts = new Tabulator('#customerContact-table', {
      data: this.customerContacts,
      layout: 'fitColumns',
      height: '30vh',
      columns: [
        { title: 'Tên liên hệ', field: 'ContactName', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Bộ phận', field: 'CustomerPart', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Chức vụ', field: 'CustomerPosition', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Team', field: 'CustomerTeam', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'SĐT', field: 'ContactPhone', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Email', field: 'ContactEmail', hozAlign: 'left', headerHozAlign: 'center' },
      ],
   
    });
  }

  // Hàm khởi tạo bảng nhân viên sale
  private initializeTabulatorEmployeeSale(): void {
    this.tabulatorEmployeeSale = new Tabulator('#employeeSale-table', {
      data: this.employeeSales,
      layout: 'fitColumns',
      height: '83vh',
      columns: [
        { title: 'Tên nhân viên sale', field: 'EmployeeName', hozAlign: 'left', headerHozAlign: 'center' },
      ],
    });
  }

  // Hàm khởi tạo bảng địa chỉ giao hàng
  private initializeTabulatorAddress(): void {
    this.tabulatorAddress = new Tabulator('#address-table', {
      data: this.address,
      layout: 'fitColumns',
      height: '30vh',
      columns: [
        { title: 'Địa chỉ giao hàng', field: 'Address', hozAlign: 'left', headerHozAlign: 'center' },
      ],
    });
  }

  // bảng Tabulator nhập liên hệ khi tạo khách hàng
  private initializeTabulatorContactsCreate(): void {
    this.tabulatorContactsCreate = new Tabulator('#customerContact-table-create', {
      data: this.customerContactsCreate,
      layout: 'fitColumns',
      height: '30vh',
      columns: [
        // { title: '', formatter: 'buttonCross', width: 40, hozAlign: 'left', cellClick: (e, cell) => {
        //     cell.getRow().delete();
        //   }
        // },
        // {
        //   title: ' + ',
        //   field: 'addRow',
        //   formatter: 'button',
        //   headerSort: false,
        //   width: 40,
        //   hozAlign: 'center',
        //   headerHozAlign: 'center',
        //   headerFormatter: function() {
        //     return "<i class='fas fa-plus' style='cursor:pointer;font-size:1.2rem;color:blue;' title='Thêm dòng'></i>";
        //   },
        //   headerClick: (e: any, column: any) => {
        //     this.addContactRow();
        //   }
        // } as any,
        {
          title: ' + ',
          field: 'actions',
          formatter: 'buttonCross', // 'X' button for deleting rows in cells
          headerSort: false,
          width: 40,
          hozAlign: 'center',
          headerHozAlign: 'center',
          headerFormatter: function() {
            return "<i class='fas fa-plus' style='cursor:pointer;font-size:1.2rem;color:blue;' title='Thêm dòng'></i>"; // '+' button in header
          },
          headerClick: (e: any, column: any) => {
            this.addContactRow();
          },
          cellClick: (e: any, cell: any) => {
            cell.getRow().delete(); // Delete row on 'X' button click
          }
        } as any,
        { title: 'Họ tên', field: 'ContactName', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Bộ phận', field: 'CustomerPart', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Chức vụ', field: 'CustomerPosition', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Team', field: 'CustomerTeam', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'SĐT', field: 'ContactPhone', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        { title: 'Email', field: 'ContactEmail', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
        
      ]
    });
    this.tabulatorContactsCreate.on('cellEdited', () => {
      this.customerContactsCreate = this.tabulatorContactsCreate.getData();
    });
    this.tabulatorContactsCreate.on('dataChanged', () => {
      this.customerContactsCreate = this.tabulatorContactsCreate.getData();
    });
  }

  // bảng Tabulator nhập địa chỉ giao hàng khi tạo khách hàng
  private initializeTabulatorAddressCreate(): void {
    this.tabulatorAddressCreate = new Tabulator('#address-table-create', {
      data: this.addressesCreate,
      layout: 'fitColumns',
      height: '30vh',
      columns: [
        {
          title: '+',
          field: 'addRow',
          headerSort: false,
          formatter: 'buttonCross', // 'X' button for deleting rows in cells
          width: 40,
          hozAlign: 'center',
          headerHozAlign: 'center',
          headerFormatter: function() {
            return "<i class='fas fa-plus-circle text-primary' style='cursor:pointer;font-size:1.2rem;' title='Thêm dòng'></i>";
          },
          headerClick: (e: any, column: any) => {
            this.addAddressRow();
          },
          cellClick: (e: any, cell: any) => {
            cell.getRow().delete(); // Delete row on 'X' button click
          }
        } as any,
        { title: 'Địa chỉ giao hàng', field: 'Address', editor: 'input', hozAlign: 'left', headerHozAlign: 'center' },
      ]
    });
    this.tabulatorAddressCreate.on('cellEdited', () => {
      this.addressesCreate = this.tabulatorAddressCreate.getData();
    });
    this.tabulatorAddressCreate.on('dataChanged', () => {
      this.addressesCreate = this.tabulatorAddressCreate.getData();
    });
  }

  // Bảng Tabulator nhập nhân viên sale khi tạo khách hàng
  private initializeTabulatorEmployeeSaleCreate(): void {
    this.tabulatorEmployeeSaleCreate = new Tabulator('#employeeSale-table-create', {
      data: this.employeeSalesCreate,
      layout: 'fitColumns',
      height: '30vh',
      columns: [
        {
          title: ' + ',
          field: 'addRow',
          headerSort: false,
          width: 40,
          formatter: 'buttonCross', // 'X' button for deleting rows in cells
          hozAlign: 'center',
          headerHozAlign: 'center',
          headerFormatter: function() {
            return "<i class='fas fa-plus-circle text-primary' style='cursor:pointer;font-size:1.2rem;' title='Thêm dòng'></i>";
          },
          headerClick: (e: any, column: any) => {
            this.addEmployeeSaleRow();
          },
          cellClick: (e: any, cell: any) => {
            cell.getRow().delete(); 
          }
        } as any,
        { 
          title: 'Tên nhân viên',
          field: 'EmployeeName',
          editor: 'list',
          editorParams: {
            values: this.employeeList.map((employee: any) => ({
              value: employee.ID,
              label: employee.FullName
            })),
            searchable: true,
            autocomplete: true,
          },
          formatter: (cell) => {
            const value = cell.getValue();
            const employee = this.employeeList.find((emp: any) => emp.ID === value);
            return employee ? employee.FullName : value;
          },
          hozAlign: 'left',
          headerHozAlign: 'center'
        }
        
      ]
    });
    this.tabulatorEmployeeSaleCreate.on('cellEdited', () => {
      this.employeeSalesCreate = this.tabulatorEmployeeSaleCreate.getData();
    });
    this.tabulatorEmployeeSaleCreate.on('dataChanged', () => {
      this.employeeSalesCreate = this.tabulatorEmployeeSaleCreate.getData();
    });
  }

  // Hàm thêm dòng mới cho từng bảng (gọi từ nút/thao tác ngoài Tabulator nếu muốn)
  addContactRow() {
    this.tabulatorContactsCreate.addRow({});
  }
  addAddressRow() {
    this.tabulatorAddressCreate.addRow({});
  }
  addEmployeeSaleRow() {
    this.tabulatorEmployeeSaleCreate.addRow({});
  }
  // Add onSubmit method
  onSubmit(form: any) {
    if(form.invalid) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    } else {
      // Format customer code by combining province code and customer code
      const fullCustomerCode = `${this.customer.CodeProvinces}-${this.customer.CustomerCode}`;
      this.customer.CustomerCode = fullCustomerCode;
      this.customer.CustomerShortName = this.customer.CustomerShortName.toUpperCase();
      this.customer.IsDeleted = false;

      if((document.getElementById('bigAccount') as HTMLInputElement).checked){
        this.customer.BigAccount = true;
      }else{
        this.customer.BigAccount = false;
      }
      
      // Get current data from tables
      const currentContacts = this.tabulatorContactsCreate.getData();
      const currentAddresses = this.tabulatorAddressCreate.getData();
      const currentSales = this.tabulatorEmployeeSaleCreate.getData();

      // Prepare the data structure matching the API
      const customerData = {
        ...this.customer,
        Contacts: currentContacts.map(contact => ({
          idConCus: contact.idConCus || 0,
          ID: contact.ID || 0,
          ContactName: contact.ContactName,
          ContactPhone: contact.ContactPhone,
          ContactEmail: contact.ContactEmail,
          CreatedDate: new Date().toISOString(),
          CustomerTeam: contact.CustomerTeam,
          CustomerPart: contact.CustomerPart,
          CustomerPosition: contact.CustomerPosition
        })),
        Addresses: currentAddresses.map(address => ({
          ID: address.ID || 0,
          Address: address.Address
        })),
        Sales: currentSales.map(sale => {
          // Nếu đang trong chế độ chỉnh sửa và có dữ liệu sale từ server
          if (this.isEditMode && this.employeeSales.length > 0) {
            const existingSale = this.employeeSales.find(es => 
              es.EmployeeID === parseInt(sale.EmployeeName) || 
              es.EmployeeName === sale.EmployeeName
            );
            if (existingSale) {
              return {
                ID: existingSale.ID,
                EmployeeID: existingSale.EmployeeID
              };
            }
          }
          // Nếu là dữ liệu mới hoặc không tìm thấy dữ liệu cũ
          return {
            ID: 0,
            EmployeeID: parseInt(sale.EmployeeName)
          };
        }),
        BusinessFieldID: this.customer.BusinessFieldID
      };

      console.log('Submitting customer data:', customerData);

      if (this.isEditMode) {
        // Handle update
        this.customerService.saveCustomer(customerData).subscribe({
          next: (response) => {
            this.showNotification('Cập nhật khách hàng thành công', true);
            this.loadCustomers();
            this.closeModal();
          },
          error: (error) => {
            this.showNotification('Cập nhật khách hàng thất bại: ' + error.message, false);
          }
        });
      } else {
        // Handle create
        this.customerService.saveCustomer(customerData).subscribe({
          next: (response) => {
            this.showNotification('Tạo khách hàng thành công', true);
            this.loadCustomers();
            this.closeModal();
          },
          error: (error) => {
            this.showNotification('Tạo khách hàng thất bại: ' + error.message, false);
          }
        });
      }
    }
  }

  closeModal() {
      const modal = document.getElementById('addCustomerModal');
      if (modal) {
        (window as any).bootstrap.Modal.getInstance(modal).hide();
      // Reset form and mode
      this.isEditMode = false;
      this.selectedCustomer = null;
      this.customer = {
        ID: 0,
        Province: '',
        CodeProvinces: '',
        CustomerCode: '',
        CustomerShortName: '',
        TaxCode: '',
        CustomerType: '',
        BigAccount: false,
        CustomerName: '',
        Address: '',
        BusinessFieldID: null,
        CustomerSpecializationID: null,
        ProductDetails: '',
        Debt: '',
        NoteDelivery: '',
        NoteVoucher: '',
        ClosingDateDebt: new Date().toISOString().split('T')[0],
        HardCopyVoucher: '',
        CheckVoucher: '',
        IsDeleted: false
      };
    }
  }

  openDeleteModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      this.showNotification('Vui lòng chọn khách hàng cần xóa', false);
      return;
    }
    this.selectedCustomerId = selectedRows[0].getData()['ID'];
    
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa khách hàng này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCustomer();
      }
    });
  }

  deleteCustomer() {
    if (this.selectedCustomerId) {
      this.customerService.deleteCustomer(this.selectedCustomerId).subscribe({
        next: (response) => {
          const confirmModal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
          // confirmModal.hide();
          this.showNotification('Xóa khách hàng thành công', true);
          this.loadCustomers();
        },
        error: (error) => {
          const confirmModal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
          // confirmModal.hide();
          this.showNotification('Xóa khách hàng thất bại: ' + error.message, false);
        }
      });
    }
  }

  showNotification(message: string, isSuccess: boolean) {
    Swal.fire({
      title: isSuccess ? 'Thành công!' : 'Thất bại!',
      text: message,
      icon: isSuccess ? 'success' : 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }

  openEditModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      this.showNotification('Vui lòng chọn khách hàng cần sửa', false);
      return;
    }

    this.isEditMode = true;
    this.selectedCustomer = selectedRows[0].getData();
    console.log('Selected Customer:', this.selectedCustomer);
    
    // Split the customer code into province code and customer number
    const customerCodeParts = this.selectedCustomer.CustomerCode?.split('-') || ['', ''];
    
    // Get BusinessFieldID from BusinessFieldLink
    this.customerService.getBusinessFieldLinkByCustomerID(this.selectedCustomer.ID).subscribe({
      next: (response) => {
        const businessFieldLink = response.data;
        if (businessFieldLink) {
          this.customer.BusinessFieldID = businessFieldLink[0].BusinessFieldID;
          console.log('BusinessFieldID:', this.customer.BusinessFieldID);
        }
      },
      error: (error) => {
        console.error('Error loading business field link:', error);
      }
    });
    
    // Populate form data
    this.customer = {
      ID: this.selectedCustomer.ID,
      Province: this.selectedCustomer.Province || this.selectedProvince?.Name || '',
      CodeProvinces: customerCodeParts[0] || '',
      // CustomerCode: customerCodeParts[1] || '',
      CustomerCode: this.selectedCustomer.CustomerShortName || '',
      CustomerShortName: this.selectedCustomer.CustomerShortName || '',
      TaxCode: this.selectedCustomer.TaxCode || '',
      CustomerType: this.selectedCustomer.CustomerType?.toString() || '',
      BigAccount: this.selectedCustomer.BigAccount || false,
      CustomerName: this.selectedCustomer.CustomerName || '',
      Address: this.selectedCustomer.Address || '',
      BusinessFieldID: this.customer.BusinessFieldID,
      CustomerSpecializationID: this.selectedCustomer.CustomerSpecializationID || null,
      ProductDetails: this.selectedCustomer.ProductDetails || '',
      Debt: this.selectedCustomer.Debt || '',
      NoteDelivery: this.selectedCustomer.NoteDelivery || '',
      NoteVoucher: this.selectedCustomer.NoteVoucher || '',
      ClosingDateDebt: this.selectedCustomer.ClosingDateDebt ? new Date(this.selectedCustomer.ClosingDateDebt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      HardCopyVoucher: this.selectedCustomer.HardCopyVoucher || '',
      CheckVoucher: this.selectedCustomer.CheckVoucher || '',
      IsDeleted: false
    };

    // Load and populate related data
    this.loadCustomerContacts(this.selectedCustomer.ID);
    this.loadCustomerEmployeeSale(this.selectedCustomer.ID);
    this.loadCustomerAddress(this.selectedCustomer.ID);

    // Open modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
  }

  // Add method to load customer address
  loadCustomerAddress(customerId: number) {
    this.customerService.getCustomerAddress(customerId).subscribe({
      next: (data) => {
        if (data.data) {
          // Handle object response
          if (typeof data.data === 'object' && !Array.isArray(data.data)) {
            this.address = [{
              ID: data.data.ID || 0,
              Address: data.data.Address || ''
            }];
          } else if (Array.isArray(data.data)) {
            this.address = data.data.map((addr: any) => ({
              ID: addr.ID || 0,
              Address: addr.Address || ''
            }));
          } else {
            this.address = [];
          }
        } else {
          this.address = [];
        }
        
        this.initializeTabulatorAddress();
        // Update create table if in edit mode
        if (this.isEditMode) {
          this.tabulatorAddressCreate.setData(this.address);
        }
      },
      error: (error) => {
        console.error('Error loading customer address:', error);
        this.showNotification('Lỗi khi tải địa chỉ giao hàng: ' + error.message, false);
      }
    });
  }
  

  resetForm() {
    this.customer = {
      ID: 0,
      Province: '',
      CodeProvinces: '',
      CustomerCode: '',
      CustomerShortName: '',
      TaxCode: '',
      CustomerType: '',
      BigAccount: false,
      CustomerName: '',
      Address: '',
      BusinessFieldID: null,
      CustomerSpecializationID: null,
      ProductDetails: '',
      Debt: '',
      NoteDelivery: '',
      NoteVoucher: '',
      ClosingDateDebt: new Date().toISOString().split('T')[0],
      HardCopyVoucher: '',
      CheckVoucher: '',
      IsDeleted: false
    };
    this.newContacts = [];
    this.newAddresses = [];
    this.newEmployeeSales = [];
    this.isEditMode = false;
    this.selectedCustomerId = 0;
    this.selectedCustomer = null;
    
    // Reset Tabulator tables
    if (this.tabulatorContactsCreate) {
      this.tabulatorContactsCreate.setData([]);
    }
    if (this.tabulatorAddressCreate) {
      this.tabulatorAddressCreate.setData([]);
    }
    if (this.tabulatorEmployeeSaleCreate) {
      this.tabulatorEmployeeSaleCreate.setData([]);
    }
  }

  openAddModal() {
    this.resetForm();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
  }

  // Add event listener for modal show
  ngAfterViewInit() {
    const addCustomerModal = document.getElementById('addCustomerModal');
    if (addCustomerModal) {
      addCustomerModal.addEventListener('show.bs.modal', () => {
        if (!this.isEditMode) {
          this.resetForm();
        }
      });
    }
  }

  async exportToExcel() {
    // Chuẩn bị dữ liệu xuất, bỏ qua object rỗng và các trường object rỗng trong từng dòng
    const exportData = this.customersToExcel
      .filter(customer => Object.keys(customer).length > 0)
      .map((customer, idx) => {
        // Loại bỏ các trường object rỗng nếu có
        const safe = (val: any) => (val && typeof val === 'object' && Object.keys(val).length === 0 ? '' : val);
        return {
          'STT': idx + 1,
          'Tên khách hàng': safe(customer.CustomerName),
          'Địa chỉ': safe(customer.Address),
          'Tỉnh': safe(customer.Province),
          'Loại hình': safe(customer.TypeName),
          'Ngành': safe(customer.Name),
          'Tên liên hệ': safe(customer.ContactName),
          'Chức vụ': safe(customer.CustomerPart),
          'ĐT': safe(customer.ContactPhone),
          'Email': safe(customer.ContactEmail),
          'Sales': safe(customer.FullName),
          'Mã khách hàng': safe(customer.CustomerCode),
          'Tên ký hiệu': safe(customer.CustomerShortName)
        };
      });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('KhachHang');

    // Thêm header
    worksheet.columns = [
      { header: 'STT', key: 'STT', width: 5, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
      { header: 'Tên khách hàng', key: 'Tên khách hàng', width: 30 },
      { header: 'Địa chỉ', key: 'Địa chỉ', width: 40 },
      { header: 'Tỉnh', key: 'Tỉnh', width: 15 },
      { header: 'Loại hình', key: 'Loại hình', width: 15 },
      { header: 'Ngành', key: 'Ngành', width: 20 },
      { header: 'Tên liên hệ', key: 'Tên liên hệ', width: 20 },
      { header: 'Chức vụ', key: 'Chức vụ', width: 15 },
      { header: 'ĐT', key: 'ĐT', width: 15 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Sales', key: 'Sales', width: 25 },
      { header: 'Mã khách hàng', key: 'Mã khách hàng', width: 20 },
      { header: 'Tên ký hiệu', key: 'Tên ký hiệu', width: 15 },
    ];

    // Thêm dữ liệu
    exportData.forEach(row => worksheet.addRow(row));

    // Định dạng header
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { name: 'Tahoma', size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' }
      };
    });
    worksheet.getRow(1).height = 30;

    // Định dạng các dòng dữ liệu
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        row.height = 40;
        row.getCell('STT').alignment = { horizontal: 'center', vertical: 'middle' };
        row.eachCell((cell, colNumber) => {
          if (colNumber !== 1) {
            cell.font = { name: 'Tahoma', size: 10 };
            cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          }
        });
      }
    });

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `DanhSachKhachHang_${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '')}.xlsx`);
  }

  openCustomerSpecializationForm() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('customerSpecializationModal'));
    modal.show();
  }

  onProvinceChange(selectedProvince: Provinces) {
    if (selectedProvince) {
      this.customer.Province = selectedProvince.Name;
      this.customer.CodeProvinces = selectedProvince.Code;
    } else {
      this.customer.Province = '';
      this.customer.CodeProvinces = '';
    }
  }
  closeSearchOffcanvas() {
    const offcanvas = document.getElementById('searchOffcanvas');
    if (offcanvas) {
      const bsOffcanvas = (window as any).bootstrap.Offcanvas.getInstance(offcanvas);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }
  }


  
}
