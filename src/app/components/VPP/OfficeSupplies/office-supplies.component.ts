import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {OfficeSuppliesService } from './office-supplies-service/office-supplies-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css'; //import Tabulator stylesheet
import { NgSelectModule } from '@ng-select/ng-select';
import { RowComponent } from 'tabulator-tables';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

interface Unit {
  ID: number;
  Name: string;
  Code: string;
}

interface Product {
  ID?: number;
  CodeRTC: string;
  CodeNCC: string;
  NameRTC: string;
  NameNCC: string;
  SupplyUnitID: number;
  Price: number;
  RequestLimit: number;
  Type: number;
}

declare var bootstrap: any; // Đảm bảo khai báo bên ngoài class, trước constructor hoặc ngOnInit
@Component({
  selector: 'app-office-supplies',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule,SweetAlert2Module],
  templateUrl: './office-supplies.component.html',
  styleUrls: ['./office-supplies.component.css'],

})
export class OfficeSuppliesComponent implements OnInit {

  lstVP: any[] = [];
  listUnit: any[] = [];
  table: any; // instance của Tabulator
  table2: any; // instance của Tabulator cho bảng thứ hai
  tableExcel: any;
  dataTable: any[] = [];
  dataTable2: any[]=[];
  dataTableExcel: any[]=[];
  lastAddedId: number | null = null; // Thêm biến để theo dõi ID của đơn vị tính mới thêm
  lastAddedIdProduct: number | null = null; // Thêm biến để theo dõi ID của sản phẩm mới thêm 
  newUnit: any = {ID:0,Name:''};
  newProduct: Product = {
    CodeRTC: '',
    CodeNCC: '',
    NameRTC: '',
    NameNCC: '',
    SupplyUnitID: 0,
    Price: 0,
    RequestLimit: 0,
    Type: 2 // default to Dùng chung
  };
  searchText: string = ''; // chứa từ khoá tìm kiếm
  isCheckmode: boolean = false;
  selectid: number = 0;
  selectedList: any[] = [];
  selectedId = 0;
  selectedItem: any = {};
  filePath: string = '';
  excelSheets: string[] = [];
  selectedSheet: string = '';
  
  // Biến hiển thị chính trên thanh tiến trình
  displayProgress: number = 0; // % hiển thị trên thanh
  displayText: string = '0/0'; // Text hiển thị trên thanh
  
  totalRowsAfterFileRead: number = 0; // Tổng số dòng dữ liệu hợp lệ sau khi đọc file
  processedRowsForSave: number = 0; // Số dòng đã được xử lý khi lưu vào DB

  typeOptions = [
    { id: 2, name: 'Dùng chung' },
    { id: 1, name: 'Cá nhân' }
  ];

  constructor(private lstVPP: OfficeSuppliesService) { }

  ngOnInit(): void {
    this.drawTable(); // Khởi tạo tất cả các bảng ở đây
    this.getAll();
    this.getUnits();
  }

//lấy ra danh sách đơn vị tính
  getUnits(): void {
    this.lstVPP.getUnit().subscribe({
      next: (res) => {
        console.log('Danh sách đơn vị tính:', res);
        this.listUnit = Array.isArray(res?.data) ? res.data : [];
        this.dataTable2 = res.data;
        if(this.lastAddedId){
          const newItem = this.listUnit.find(item => item.ID === this.lastAddedId);
          if(newItem){
            //Tách đơn vị mới ra khỏi danh sách
            this.listUnit = this.listUnit.filter(item => item.ID !== this.lastAddedId);
            //Sắp xếp các đơn vị còn lại theo ID tăng dần
            this.listUnit.sort((a, b) => a.ID - b.ID);
            //Thêm đơn vị mới vào đầu danh sách
            this.listUnit.unshift(newItem);
          }
        }else{
          //Nếu không có đơn vị mới, sắp xếp tất cả theo ID tăng dần
          this.listUnit.sort((a, b) => a.ID - b.ID);
        }
        if (this.table2) {
          this.table2.replaceData(this.dataTable2);
        } else {
          // Nếu table2 chưa được khởi tạo (ví dụ: trong trường hợp lỗi ngOnInit), gọi drawTable
          this.drawTable(); 
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn vị tính:', err);
      }
    });
  }
  
  private drawTable(): void {
    // Khởi tạo bảng chính (this.table)
    if (!this.table) { // Chỉ khởi tạo nếu chưa có
      this.table = new Tabulator('#datatable', {
        data: this.dataTable,
        layout: 'fitDataFill',
        height: '70vh',
        selectableRows: 10,
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
       
        columns: [
          { 
            title: "",
            formatter: "rowSelection", 
            titleFormatter: "rowSelection",
            hozAlign: "center",
            headerHozAlign: "center",
            headerSort: false,
            width: 40,
            frozen: true,
            
          },
          { title: 'Mã RTC', field: 'CodeRTC', hozAlign: 'left', headerHozAlign: 'center', width: 80,   bottomCalc: "count",},
          { title: 'Mã NCC', field: 'CodeNCC', hozAlign: 'left', headerHozAlign: 'center', width: 100 },
          { title: 'Tên (RTC)', field: 'NameRTC', hozAlign: 'left', headerHozAlign: 'center', width: 200 },
          { title: 'Tên (NCC)', field: 'NameNCC', hozAlign: 'left', headerHozAlign: 'center', width: 350 },
          {
            title: 'Đơn vị tính', field: 'Unit', hozAlign: 'left', headerHozAlign: 'center', width: 80
          },
          {
            title: 'Giá (VND)', field: 'Price', hozAlign: 'right', headerHozAlign: 'center', 
            width: 120,
            formatter: "money",
            formatterParams: {
              precision: 0,
              decimal: ".",
              thousand: ",",
              symbol: "",
              symbolAfter: true
            },
            bottomCalc: "sum",
            bottomCalcFormatter: "money",
            bottomCalcFormatterParams: {
              precision: 0,
              decimal: ".",
              thousand: ",",
              symbol: "",
              symbolAfter: true
            }
          },
          { title: 'Định mức', field: 'RequestLimit', hozAlign: 'right', headerHozAlign: 'center', width: 80 },
          { title: 'Loại', field: 'TypeName', hozAlign: 'left', headerHozAlign: 'center', width: 80 }
        ],
      });
    }

    // Khởi tạo bảng thứ hai (this.table2)
    if (!this.table2) { // Chỉ khởi tạo nếu chưa có
      this.table2 = new Tabulator('#datatable2', {
        data: this.dataTable2,
        layout: 'fitDataFill',
        height: '50vh',
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        columns: [
          {
            title: 'Mã đơn vị',
            field: 'ID',
            hozAlign: 'center',
            headerHozAlign: 'center',
          },
          {
            title: 'Tên đơn vị',
            field: 'Name',
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: "50%"
          }
        ]
      });

      // Thêm sự kiện click cho bảng thứ hai
      this.table2.on("rowClick", (e: MouseEvent, row: RowComponent) => {
        const rowData = row.getData();
        this.selectedItem = {
          ID: rowData['ID'],
          Name: rowData['Name']
        };
        console.log('Selected item:', this.selectedItem);
        // Gọi API để lấy dữ liệu chi tiết
        this.getdataUnitbyid(rowData['ID']);
      });
    }
    
    // Khởi tạo bảng dữ liệu Excel (this.tableExcel)
    // Đặt chiều cao hợp lý cho bảng trong modal
    if (!this.tableExcel) { // Chỉ khởi tạo nếu chưa có
      this.tableExcel = new Tabulator('#datatableExcel', {
        data: this.dataTableExcel, // Dữ liệu ban đầu rỗng
        layout: 'fitDataFill',
        height: '300px', // Chiều cao cố định cho bảng trong modal
        selectableRows: 10,
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        columns: [
          // Các cột này sẽ được cập nhật sau khi đọc Excel, có thể đặt tiêu đề rỗng ban đầu
          { title: 'Mã RTC', field: 'CodeRTC', hozAlign: 'left', headerHozAlign: 'center', width: 80 },
          { title: 'Mã NCC', field: 'CodeNCC', hozAlign: 'left', headerHozAlign: 'center', width: 100 },
          { title: 'Tên (RTC)', field: 'NameRTC', hozAlign: 'left', headerHozAlign: 'center', width: 200 },
          { title: 'Tên (NCC)', field: 'NameNCC', hozAlign: 'left', headerHozAlign: 'center', width: 350 },
          {
            title: 'Đơn vị tính', field: 'Unit', hozAlign: 'left', headerHozAlign: 'center', width: 80
          },
          {
            title: 'Giá (VND)', field: 'Price', hozAlign: 'right', headerHozAlign: 'center', 
            width: 120,
            formatter: "money",
            formatterParams: {
              precision: 0,
              decimal: ".",
              thousand: ",",
              symbol: "",
              symbolAfter: true
            }
          },
          { title: 'Định mức', field: 'RequestLimit', hozAlign: 'right', headerHozAlign: 'center', width: 80 },
          { title: 'Loại', field: 'Type', hozAlign: 'left', headerHozAlign: 'center', width: 80 } // Cột Type nên hiển thị giá trị gốc từ Excel
        ],
      });   
    }
  }
  getdataUnitbyid(id: number) {
    console.log("id", id);
    this.lstVPP.getdataUnitfill(id).subscribe({
      next: (response) => {
        console.log('Dữ liệu click sửa được:', response);
        let data = null;
        if (response?.data) {
          data = Array.isArray(response.data) ? response.data[0] : response.data;
        } else {
          data = response;
        }

        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          this.selectedItem = {
            ID: data['ID'] || '',
            Name: data['Name'] || '',
          };
          console.log('Selected item after API call:', this.selectedItem);
        } else {
          console.warn('Không có dữ liệu để fill');
          console.log('Giá trị data:', data);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu:', err);
      }
    });
  }
  saveSelectedItem() {
    if (!this.selectedItem?.Name) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Tên đơn vị không được để trống!',
      });
      return;
    }

    // Nếu không có ID hoặc ID = 0, tạo mới
    if (!this.selectedItem?.ID || this.selectedItem.ID === 0) {
      this.lstVPP.addUnit({ ID: 0, Name: this.selectedItem.Name }).subscribe({
        next: (response) => {
          if(response && response.data){
            const newItem = Array.isArray(response.data) ? response.data[0] : response.data;
            this.lastAddedId = newItem.ID;
          }
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Thêm mới thành công!',
          });
          this.selectedItem = {}; // Reset form
          this.getUnits(); // Refresh the table
        },
        error: (err) => {
          console.error('Lỗi khi thêm mới:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Có lỗi xảy ra khi thêm mới!',
          });
        }
      });
    } else {
      // Nếu có ID, cập nhật
      this.lstVPP.updatedataUnit(this.selectedItem).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Cập nhật thành công!',
          });
          this.selectedItem = {}; // Reset form
          this.getUnits(); // Refresh the table
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật dữ liệu:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Có lỗi xảy ra khi cập nhật dữ liệu!',
          });
        }
      });
    }
  }

  //lấy ra dữ liệu
  getAll(): void {
    this.lstVPP.getdata(this.searchText).subscribe({
      next: (res) => {
        console.log('Dữ liệu nhận được:', res);
        this.lstVP = res.data.officeSupply;
        
        // Sắp xếp dữ liệu: sản phẩm mới nhất lên đầu, các sản phẩm khác theo thứ tự tăng dần
        if (this.lastAddedIdProduct) {
          const newItem = this.lstVP.find(item => item.ID === this.lastAddedIdProduct);
          if (newItem) {
            // Tách sản phẩm mới ra khỏi danh sách
            this.lstVP = this.lstVP.filter(item => item.ID !== this.lastAddedIdProduct);
            // Sắp xếp các sản phẩm còn lại theo ID tăng dần
            this.lstVP.sort((a, b) => a.ID - b.ID);
            // Thêm sản phẩm mới vào đầu danh sách
            this.lstVP.unshift(newItem);
          }
        } else {
          // Nếu không có sản phẩm mới, sắp xếp tất cả theo ID tăng dần
          this.lstVP.sort((a, b) => a.ID - b.ID);
        }

        // Cập nhật lại dataTable và reload bảng
        this.dataTable = this.lstVP;
        if (this.table) {
          this.table.replaceData(this.dataTable);
        } else {
          this.drawTable(); // Lần đầu thì vẽ bảng
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        this.lstVP = [];
        this.dataTable = [];
        this.drawTable();
      },
    });
  }
  onSearchChange(event: any = null): void {
    this.getAll();
  }

  add(): void {
    if (!this.newProduct.CodeNCC || !this.newProduct.NameNCC || !this.newProduct.Price || !this.newProduct.SupplyUnitID) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng điền đầy đủ thông tin!',
        showConfirmButton: true,
        timer: 1500
      });
      return;
    }
    this.lstVPP.adddata(this.newProduct).subscribe({
      next: (res) => {
        if(res && res.data){
          const newItem = Array.isArray(res.data) ? res.data[0] : res.data;
          this.lastAddedIdProduct = newItem.ID;
        }
        Swal.fire({
          icon: 'success',
          title: 'Thông báo',
          text: 'Thêm thành công!',
          showConfirmButton: true,
          timer: 1500
        });
        this.closeModal();
        this.getAll(); 

        // Cập nhật lại dataTable và reload bảng
        this.dataTable = this.lstVP;
        if (this.table) {
          this.table.replaceData(this.dataTable);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Thông báo',
          text: 'Có lỗi xảy ra khi thêm dữ liệu!',
          showConfirmButton: true,
          timer: 1500
        });
      }
    });
  }
  delete(): void {
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      if (!this.selectedList.some(item => item.ID === row.ID)) {
        this.selectedList.push(row);
      }
    });
    const ids = this.selectedList.map(item => item.ID);
    if (ids.length == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng chọn 1 sản phẩm để xóa!',
        showConfirmButton: true,
        timer: 1500
      });
      return;
    }
    else {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Bạn có chắc chắn muốn xóa không?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.lstVPP.deletedata(ids).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Thông báo',
                text: 'Đã xóa thành công!',
                showConfirmButton: true,
                timer: 1500
              });
              this.getAll();
              this.selectedList = [];
            },
            error: (err: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Thông báo',
                text: 'Có lỗi xảy ra khi xóa dữ liệu!',
                showConfirmButton: true,
                timer: 1500
              });
            }
          });
        }
      });
    }
  }

  //cập nhật
  update(): void {
    if (!this.newProduct.CodeNCC || !this.newProduct.NameNCC || !this.newProduct.Price || !this.newProduct.SupplyUnitID) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng điền đầy đủ thông tin!',
        showConfirmButton: true,
        timer: 1500
      });
      return;
    }
    console.log('Dữ liệu update:', this.newProduct);
    this.lstVPP.updatedata(this.newProduct).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Thông báo',
          text: 'Cập nhật thành công!',
          showConfirmButton: true,
          timer: 1500
        });
        this.closeModal();
        this.getAll();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Thông báo',
          text: 'Có lỗi xảy ra khi cập nhật dữ liệu!',
          showConfirmButton: true,
          timer: 1500
        });
      }
    });
  }

  //fill dữ liệu lên modal khi update dữ liệu
  getdatabyid(id: number) {
    console.log("id", id);

    this.lstVPP.getdatafill(id).subscribe({
      next: (res) => {
        let data = null;
        this.isCheckmode = true;
        if (res?.data) {
          data = Array.isArray(res.data) ? res.data[0] : res.data;
        } else {
          data = res; // fallback nếu không có res.data
        }

        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          this.newProduct = {
            ID: data.ID || id,
            CodeRTC: data.CodeRTC || '',
            CodeNCC: data.CodeNCC || '',
            NameRTC: data.NameRTC || '',
            NameNCC: data.NameNCC || '',
            Price: data.Price ?? null,
            SupplyUnitID: data.SupplyUnitID ?? 0,
            RequestLimit: data.RequestLimit ?? null,
            Type: data.Type ?? 0,
          };

        } else {

          console.warn('Không có dữ liệu để fill');
          console.log('Giá trị data:', data);
        }
      }
    });

  }

  openModalDVT(){
    const modalEl = document.getElementById('officeSupplyUnitModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

      modal.show();
      console.log('ischeckmode:', this.isCheckmode);
    }
  }
  closeModalDVT() {
    this.selectedList=[];
    const modalEl = document.getElementById('officeSupplyUnitModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }
  //liên quản đến đóng mở modal để khi thêm và update dữ liệu
  openModal() {
    const modalEl = document.getElementById('detailProductModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

      modal.show();
      console.log('ischeckmode:', this.isCheckmode);
    }
  }
  
  openModalForNewProduct() {
    this.isCheckmode = false;
  
    // Gọi API để lấy mã CodeRTC mới
    this.lstVPP.getdata(this.searchText).subscribe({
      next: (res) => {
        console.log('Response từ nextCodeRTC:', res);
        this.newProduct = {
          CodeRTC: res.data.nextCode,
          CodeNCC: '',
          NameRTC: '',
          NameNCC: '',
          Price: 0,
          SupplyUnitID: 0,
          RequestLimit: 0,
          Type: 2,
        };
        this.openModal();
      },
      error: (err) => {
        console.error('Lỗi khi lấy CodeRTC:', err);
        this.newProduct = {
          CodeRTC: 'VPP-TAM',
          CodeNCC: '',
          NameRTC: '',
          NameNCC: '',
          Price: 0,
          SupplyUnitID: 0,
          RequestLimit: 0,
          Type: 2,
        };
        this.openModal();
      }
    });
  }
  openModalForUpdateProduct() {
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      if (!this.selectedList.some(item => item.ID === row.ID)) {
        this.selectedList.push(row);
      }
    });
    const ids = this.selectedList.map(item => item.ID);
    this.isCheckmode = true;
    if (this.selectedList.length == 0) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng chọn 1 sản phẩm để sửa!',
        showConfirmButton: true,
        timer: 1500
      });
      this.selectedList=[];
      return;
    } else if (this.selectedList.length > 1) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng chỉ chọn 1 sản phẩm để sửa!',
        showConfirmButton: true,
        timer: 1500
      });
      this.selectedList=[];
      return;
    } else {
      this.getdatabyid(this.selectedList[0].ID);
      this.openModal();
    }
  }
  closeModal() {
    this.selectedList=[];
    const modalEl = document.getElementById('detailProductModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }
//Thêm đơn vị tính
  addNewUnit(): void {
    if (!this.newUnit.Name) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Vui lòng điền đầy đủ thông tin đơn vị!',
        showConfirmButton: true,
        timer: 1500
      });
      return;
    }
    this.lstVPP.addUnit(this.newUnit).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Thông báo',
          text: 'Thêm đơn vị thành công!',
          showConfirmButton: true,
          timer: 1500
        });
        this.newUnit={ID:0,Name:''};
        this.closeUnitModal();
        this.getUnits(); 
        
      },
      error: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Thông báo',
          text: 'Có lỗi xảy ra khi thêm đơn vị!',
          showConfirmButton: true,
          timer: 1500
        });
      }
    });
  }

  closeUnitModal() {
    const modalEl = document.getElementById('addUnitModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }

  exportToExcel() {
    const now = new Date();
    const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    
    if (this.table) {
      this.table.download("xlsx", `DanhSachVPP_${dateStr}.xlsx`, {
        sheetName: "Danh sách VPP",
        sheetHeader: true,
        columnHeaders: true,
        columnGroups: false,
        rowGroups: false,
        columnCalcs: false,
        dataTree: false,
        style: true
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Bảng chưa được khởi tạo!',
      });
    }
  }

  formatCurrency(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    const number = Number(value);
    event.target.value = number.toLocaleString('vi-VN');
    this.newProduct.Price = number;
  }

  edit(): void {
    var dataSelect = this.table.getSelectedData();
    dataSelect.forEach((row: any) => {
      if (!this.selectedList.some(item => item.ID === row.ID)) {
        this.selectedList.push(row);
      }
    });
    
    if (this.selectedList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng chọn 1 sản phẩm để sửa!',
      });
      return;
    } else if (this.selectedList.length > 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: 'Vui lòng chỉ chọn 1 sản phẩm để sửa!',
      });
      this.selectedList = [];
      return;
    }

    this.isCheckmode = true;
    this.getdatabyid(this.selectedList[0].ID);
    this.openModal();
  }
  OpenModalExcel(): void {
    const modalEl = document.getElementById('ExcelModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
      // Reset trạng thái tiến trình khi mở modal
      this.resetExcelImportState(); // Sử dụng hàm reset
    }
  }

  importFromExcel(): void {
    if (this.table) {
      this.table.import("xlsx", [".xlsx", ".csv", ".ods"], "buffer");
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Bảng chưa được khởi tạo!',
      });
    }
  }

  openFileExplorer() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        console.log('File đã chọn:', file.name); // Log để kiểm tra
        console.log('Phần mở rộng:', fileExtension); // Log để kiểm tra

        if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Vui lòng chọn tệp Excel (.xlsx hoặc .xls)!',
              showConfirmButton: true,
              timer: 1500
            });
            input.value = ''; // Xóa input để có thể chọn lại file
            this.resetExcelImportState(); // Reset trạng thái khi có lỗi định dạng
            return;
        }

        this.filePath = file.name;
        this.excelSheets = [];
        this.selectedSheet = '';
        this.dataTableExcel = [];
        this.totalRowsAfterFileRead = 0;
        this.processedRowsForSave = 0; // Reset cho giai đoạn lưu

        // Đặt trạng thái ban đầu cho thanh tiến trình: Đang đọc file
        this.displayProgress = 0;
        this.displayText = 'Đang đọc file...'; 
        console.log('Progress bar state set to: Đang đọc file...'); // Log trạng thái ban đầu

        const reader = new FileReader();

        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                this.displayProgress = Math.round((event.loaded / event.total) * 100);
                this.displayText = `Đang tải file: ${this.displayProgress}%`;
                // console.log(`Tiến trình đọc file: ${this.displayProgress}%`); // Bỏ comment nếu muốn log chi tiết tiến trình tải
            }
        };

        let startTime = Date.now(); // Ghi lại thời gian bắt đầu đọc file

        reader.onload = async (e: any) => {
            const data = e.target.result;
            console.log('FileReader.onload đã hoàn thành. Bắt đầu xử lý ExcelJS.'); // Log
            try {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(data);
                console.log('Workbook đã được tải bởi ExcelJS.'); // Log

                this.excelSheets = workbook.worksheets.map(sheet => sheet.name);
                console.log('Danh sách sheets tìm thấy:', this.excelSheets); // Log

                if (this.excelSheets.length > 0) {
                    this.selectedSheet = this.excelSheets[0];
                    console.log('Sheet mặc định được chọn:', this.selectedSheet); // Log
                    await this.readExcelData(workbook, this.selectedSheet);
                    
                    const elapsedTime = Date.now() - startTime;
                    const minDisplayTime = 500; // Thời gian hiển thị tối thiểu cho trạng thái tải (500ms)

                    if (elapsedTime < minDisplayTime) {
                        // Nếu quá trình xử lý nhanh hơn thời gian tối thiểu, đợi thêm
                        setTimeout(() => {
                            this.displayProgress = 0; // Luôn hiển thị 0% cho trạng thái "0/tổng số dòng"
                            if (this.totalRowsAfterFileRead === 0) {
                                this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
                            } else {
                                this.displayText = `0/${this.totalRowsAfterFileRead} dòng`;
                            }
                            console.log('Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật (sau delay).');
                        }, minDisplayTime - elapsedTime);
                    } else {
                        // Nếu quá trình xử lý đã đủ lâu, cập nhật ngay lập tức
                        this.displayProgress = 0;
                        if (this.totalRowsAfterFileRead === 0) {
                            this.displayText = 'Không có dữ liệu hợp lệ trong sheet.';
                        } else {
                            this.displayText = `0/${this.totalRowsAfterFileRead} dòng`;
                        }
                        console.log('Dữ liệu đã được đọc và bảng Excel preview đã được cập nhật.');
                    }

                } else {
                    console.warn('File Excel không chứa bất kỳ sheet nào.'); // Log
                    Swal.fire({
                      icon: 'warning',
                      title: 'Thông báo',
                      text: 'File Excel không có sheet nào!',
                      showConfirmButton: true,
                      timer: 1500
                    });
                    this.resetExcelImportState();
                }
            } catch (error) {
                console.error('Lỗi khi đọc tệp Excel trong FileReader.onload:', error); // Log chi tiết lỗi
                Swal.fire({
                  icon: 'error',
                  title: 'Lỗi',
                  text: 'Không thể đọc tệp Excel. Vui lòng đảm bảo tệp không bị hỏng và đúng định dạng.',
                  showConfirmButton: true,
                  timer: 2500
                });
                this.resetExcelImportState(); // Reset trạng thái khi có lỗi
            }
            input.value = ''; // Xóa input để có thể chọn lại cùng file
        };
        reader.readAsArrayBuffer(file); // Bắt đầu đọc file ngay lập tức
    }
  }

  async readExcelData(workbook: ExcelJS.Workbook, sheetName: string) {
    console.log(`Bắt đầu đọc dữ liệu từ sheet: "${sheetName}"`); // Log
    try {
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" không tồn tại trong workbook.`); // Log lỗi cụ thể
      }

      const data: any[] = [];
      let validRecords = 0;

      // Đọc dữ liệu từ hàng thứ 3 trở đi (bỏ qua 2 hàng header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) { 
          const rowData: any = {
            CodeRTC: row.getCell(2).value?.toString() || '',
            CodeNCC: row.getCell(3).value?.toString() || '',
            NameRTC: row.getCell(4).value?.toString() || '',
            NameNCC: row.getCell(5).value?.toString() || '',
            Unit: row.getCell(6).value?.toString() || '',
            Price: Number(row.getCell(7).value) || 0,
            RequestLimit: Number(row.getCell(8).value) || 0,
            Type: row.getCell(9).value?.toString() || ''
          };
          
          // Kiểm tra nếu hàng không rỗng hoàn toàn để tránh các hàng trống cuối file
          // Một hàng được coi là rỗng nếu tất cả các giá trị của nó đều là null, rỗng, hoặc 0
          const isEmptyRow = !Object.values(rowData).some(val => 
            val !== null && val !== '' && val !== 0
          );

          if (!isEmptyRow) {
            validRecords++;
            data.push(rowData);
          }
        }
      });

      this.dataTableExcel = data;
      this.totalRowsAfterFileRead = validRecords; // Cập nhật tổng số dòng hợp lệ
      console.log(`Đã đọc ${validRecords} dòng dữ liệu hợp lệ từ sheet.`); // Log
      console.log('Dữ liệu đọc được để preview:', this.dataTableExcel); // Log

      // Cập nhật hiển thị sau khi đọc dữ liệu xong (0/tổng số dòng)
      this.displayProgress = 0; 
      if (this.totalRowsAfterFileRead === 0) {
        this.displayText = 'Không có dữ liệu hợp lệ trong sheet.'; // Thông báo rõ ràng hơn
      } else {
        this.displayText = `0/${this.totalRowsAfterFileRead} dòng`;
      }
      
      // Cập nhật Tabulator
      if (this.tableExcel) {
        this.tableExcel.replaceData(this.dataTableExcel);
        console.log('Tabulator Excel đã được cập nhật dữ liệu.'); // Log
      } else {
        // Trường hợp này ít xảy ra nếu drawTable được gọi trong ngOnInit
        this.drawTable(); 
        console.log('Tabulator Excel được khởi tạo lại thông qua drawTable.'); // Log
      }

    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu từ sheet trong readExcelData:', error); // Log chi tiết lỗi
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể đọc dữ liệu từ sheet! Vui lòng kiểm tra định dạng dữ liệu.',
        showConfirmButton: true,
        timer: 1500
      });
      this.resetExcelImportState(); // Reset trạng thái khi có lỗi
    }
  }

  onSheetChange() {
    console.log('Sheet đã thay đổi thành:', this.selectedSheet); // Log
    if (this.filePath) {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e: any) => {
                const data = e.target.result;
                try {
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(data);
                    await this.readExcelData(workbook, this.selectedSheet);
                    // Sau khi thay đổi sheet và đọc dữ liệu, đặt lại thanh tiến trình
                    this.displayProgress = 0;
                    // displayText được cập nhật trong readExcelData
                    console.log('Dữ liệu đã được đọc lại sau khi thay đổi sheet.'); // Log
                } catch (error) {
                    console.error('Lỗi khi đọc tệp Excel khi thay đổi sheet:', error);
                    Swal.fire({
                      icon: 'error',
                      title: 'Lỗi',
                      text: 'Không thể đọc dữ liệu từ sheet đã chọn!',
                      showConfirmButton: true,
                      timer: 1500
                    });
                    this.resetExcelImportState(); // Reset trạng thái khi có lỗi
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }
  }

  saveExcelData() {
    console.log('--- Bắt đầu saveExcelData ---');
    console.log('Tổng số bản ghi cần lưu:', this.dataTableExcel.length);
    console.log('Dữ liệu Excel hiện tại:', this.dataTableExcel);

    if (!this.dataTableExcel || this.dataTableExcel.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Thông báo',
        text: 'Không có dữ liệu để lưu!',
        showConfirmButton: true,
        timer: 1500
      });
      console.log('Không có dữ liệu để lưu.');
      return;
    }

    // Reset tiến trình cho giai đoạn lưu dữ liệu
    this.processedRowsForSave = 0;
    const totalProductsToSave = this.dataTableExcel.length;
    this.displayText = `Đang lưu: 0/${totalProductsToSave} bản ghi`; // Văn bản ban đầu cho giai đoạn lưu
    this.displayProgress = 0; // Bắt đầu thanh tiến trình từ 0%

    // Lấy danh sách mã sản phẩm cần kiểm tra
    const codesToCheck = this.dataTableExcel.map(item => ({
      CodeRTC: item.CodeRTC,
      CodeNCC: item.CodeNCC
    }));

    console.log('codesToCheck (dữ liệu gửi đi kiểm tra):', codesToCheck);

    // Gọi API để kiểm tra các mã và lấy ID
    this.lstVPP.checkProductCodes(codesToCheck).subscribe({
      next: (response: any) => {
        console.log('Response từ checkProductCodes API:', response);
        const existingProducts = (response.data && Array.isArray(response.data.existingProducts)) ? response.data.existingProducts : [];
        console.log('existingProducts (sau khi xử lý response):', existingProducts);
        
        const processedData = this.dataTableExcel.map((row, index) => {
          const existingProduct = existingProducts.find((p: any) => 
            p.CodeRTC === row.CodeRTC && p.CodeNCC === row.CodeNCC
          );

          const assignedId = existingProduct ? existingProduct.ID : 0;

          return {
            id: assignedId,
            codeRTC: row.CodeRTC || '',
            codeNCC: row.CodeNCC || '',
            nameRTC: row.NameRTC || '',
            nameNCC: row.NameNCC || '',
            unitId: this.getUnitIdByName(row.Unit),
            price: Number(row.Price) || 0,
            requestLimit: Number(row.RequestLimit) || 0,
            type: row.Type === 'Cá nhân' ? 1 : 2,
            isActive: true
          };
        });

        console.log('processedData (dữ liệu cuối cùng gửi đi lưu):', processedData);

        let successCount = 0;
        let errorCount = 0;
        let completedRequests = 0;

        if (totalProductsToSave === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Thông báo',
            text: 'Không có sản phẩm nào để lưu',
            showConfirmButton: true
          });
          this.closeExcelModal();
          console.log('Không có sản phẩm nào để lưu sau xử lý.');
          return;
        }

        processedData.forEach((product, index) => {
          console.log(`Gửi lưu sản phẩm ${index + 1}/${totalProductsToSave}:`, product);
          this.lstVPP.adddata(product).subscribe({
            next: (response) => {
              console.log(`Response từ adddata cho sản phẩm ${index + 1}:`, response);
              if (response.status === 1) {
                successCount++;
              } else {
                errorCount++;
                console.error(`Lỗi khi lưu sản phẩm ${index + 1}:`, response.message);
              }

              completedRequests++;
              this.processedRowsForSave = completedRequests;
              // Cập nhật thanh tiến trình và văn bản
              this.displayProgress = Math.round((completedRequests / totalProductsToSave) * 100);
              this.displayText = `Đang lưu: ${completedRequests}/${totalProductsToSave} bản ghi`;

              // Kiểm tra xem tất cả các request đã hoàn thành chưa
              if (completedRequests === totalProductsToSave) {
                console.log('--- Tất cả các request adddata đã hoàn thành ---');
                this.showSaveSummary(successCount, errorCount, totalProductsToSave);
              }
            },
            error: (err) => {
              errorCount++;
              console.error(`Lỗi khi lưu sản phẩm ${index + 1}:`, err);

              completedRequests++;
              this.processedRowsForSave = completedRequests;
              // Cập nhật thanh tiến trình và văn bản
              this.displayProgress = Math.round((completedRequests / totalProductsToSave) * 100);
              this.displayText = `Đang lưu: ${completedRequests}/${totalProductsToSave} bản ghi`;

              // Kiểm tra xem tất cả các request đã hoàn thành chưa
              if (completedRequests === totalProductsToSave) {
                console.log('--- Tất cả các request adddata đã hoàn thành ---');
                this.showSaveSummary(successCount, errorCount, totalProductsToSave);
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Lỗi khi kiểm tra mã sản phẩm từ API:', err);
        Swal.fire({
          icon: 'error',
          title: 'Thông báo',
          text: 'Có lỗi xảy ra khi kiểm tra mã sản phẩm!',
          showConfirmButton: true,
          timer: 1500
        });
        this.displayText = 'Lỗi kiểm tra sản phẩm!';
        this.displayProgress = 0;
      }
    });
  }

  // Thêm phương thức hiển thị tóm tắt kết quả lưu
  showSaveSummary(successCount: number, errorCount: number, totalProducts: number) {
    console.log('--- Hiển thị tóm tắt kết quả lưu ---');
    console.log(`Tổng sản phẩm: ${totalProducts}, Thành công: ${successCount}, Thất bại: ${errorCount}`);

    if (errorCount === 0) {
      Swal.fire({
        title: 'Thành công!',
        text: `Đã lưu ${successCount} sản phẩm thành công`, 
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else if (successCount === 0) {
        Swal.fire({
        title: 'Lỗi!',
        text: `Lưu thất bại ${errorCount}/${totalProducts} sản phẩm`, 
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Cảnh báo!',
        text: `Đã lưu ${successCount} sản phẩm thành công, ${errorCount} sản phẩm thất bại`, 
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
    this.closeExcelModal();
    this.getAll(); // Refresh the table
    console.log('--- Kết thúc hiển thị tóm tắt ---');
  }

  // Hàm helper để lấy ID của đơn vị tính từ tên
  private getUnitIdByName(unitName: string): number {
    const unit = this.listUnit.find(u => u.Name === unitName);
    return unit ? unit.ID : 0;
  }

  // Hàm mới để reset trạng thái nhập Excel
  private resetExcelImportState(): void {
    this.filePath = '';
    this.excelSheets = [];
    this.selectedSheet = '';
    this.dataTableExcel = [];
    this.displayText = '0/0'; 
    this.displayProgress = 0;
    this.totalRowsAfterFileRead = 0;
    this.processedRowsForSave = 0;
    
    if (this.tableExcel) {
      this.tableExcel.replaceData([]); // Xóa dữ liệu trong Tabulator preview
    }
    console.log('Trạng thái nhập Excel đã được reset.'); // Log
  }

  closeExcelModal() {
    const modalEl = document.getElementById('ExcelModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    this.resetExcelImportState(); // Gọi hàm reset khi đóng modal
  }
}
