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
  uploadProgress: number = 0; // Thêm biến theo dõi tiến trình

  typeOptions = [
    { id: 2, name: 'Dùng chung' },
    { id: 1, name: 'Cá nhân' }
  ];



  constructor(private lstVPP: OfficeSuppliesService) { }

  ngOnInit(): void {
    this.drawTable();
    this.getAll();
    this.getUnits();

    // Thêm event listener cho việc import
    // if (this.table) {
    //   this.table.on("dataLoaded", (data: any[]) => {
    //     // Xử lý dữ liệu sau khi import
    //     const processedData = data.map(row => ({
    //       CodeRTC: row.CodeRTC || '',
    //       CodeNCC: row.CodeNCC || '',
    //       NameRTC: row.NameRTC || '',
    //       NameNCC: row.NameNCC || '',
    //       SupplyUnitID: this.getUnitIdByName(row.Unit),
    //       Price: Number(row.Price) || 0,
    //       RequestLimit: Number(row.RequestLimit) || 0,
    //       Type: row.Loại === 'Cá nhân' ? 1 : 2
    //     }));

        // Lưu dữ liệu vào database
    //     this.lstVPP.adddata(processedData).subscribe({
    //       next: () => {
    //         Swal.fire({
    //           icon: 'success',
    //           title: 'Thông báo',
    //           text: 'Nhập dữ liệu thành công!',
    //           showConfirmButton: true,
    //           timer: 1500
    //         });
    //         this.getAll(); // Refresh the table
    //       },
    //       error: (err) => {
    //         Swal.fire({
    //           icon: 'error',
    //           title: 'Thông báo',
    //           text: 'Có lỗi xảy ra khi nhập dữ liệu!',
    //           showConfirmButton: true,
    //           timer: 1500
    //         });
    //       }
    //     });
    //   });
    // }
  }

  // Hàm helper để lấy ID của đơn vị tính từ tên
  // private getUnitIdByName(unitName: string): number {
  //   const unit = this.listUnit.find(u => u.Name === unitName);
  //   return unit ? unit.ID : 0;
  // }

//lấy ra danh sách đơn vị tính
  getUnits(): void {
    this.lstVPP.getUnit().subscribe({
      next: (res) => {
        console.log('Danh sách đơn vị tính:', res);
        this.listUnit = Array.isArray(res?.data) ? res.data : [];
        this.dataTable2 = res.data;
        if (this.table2) {
          this.table2.replaceData(this.dataTable2);
        } else {
          this.drawTable();
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn vị tính:', err);
      }
    });
  }
 
  private drawTable(): void {
    // Khởi tạo bảng đầu tiên
    if (this.table) {
      this.table.replaceData(this.dataTable);
    } else {
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
          { title: 'Loại', field: 'TypeName', hozAlign: 'left', headerHozAlign: 'center', width: 80 }
        ],
      });
    }

    // Khởi tạo bảng thứ hai
    if (this.table2) {
      this.table2.replaceData(this.dataTable2);
    } else {
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
    
    //khoi tao bang du lieu Excel
    if(this.tableExcel){
      this.tableExcel.replaceData(this.dataTableExcel);
      
    }else{
      this.tableExcel = new Tabulator('#datatableExcel', {
         data: this.dataTable,
        layout: 'fitDataFill',
        height: '50vh',
        selectableRows: 10,
        pagination: true,
        paginationSize: 50,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        columns: [
          { title: '', field: 'CodeRTC', hozAlign: 'left', headerHozAlign: 'center', width: 80 },
          { title: '', field: 'CodeNCC', hozAlign: 'left', headerHozAlign: 'center', width: 100 },
          { title: '', field: 'NameRTC', hozAlign: 'left', headerHozAlign: 'center', width: 200 },
          { title: '', field: 'NameNCC', hozAlign: 'left', headerHozAlign: 'center', width: 350 },
          {
            title: '', field: 'Unit', hozAlign: 'left', headerHozAlign: 'center', width: 80
          },
          {
            title: '', field: 'Price', hozAlign: 'right', headerHozAlign: 'center', 
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
          { title: '', field: 'RequestLimit', hozAlign: 'right', headerHozAlign: 'center', width: 80 },
          { title: '', field: 'TypeName', hozAlign: 'left', headerHozAlign: 'center', width: 80 }
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
        showConfirmButton: true,
        showCancelButton: true,
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
  OpenModalExcel(): void{
    const modalEl = document.getElementById('ExcelModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

      modal.show();
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
      
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)!',
          showConfirmButton: true,
          timer: 1500
        });
        input.value = ''; // Reset input
        this.filePath = ''; // Reset file path
        this.excelSheets = []; // Reset sheets
        return;
      }

      // Lưu file và đường dẫn
      this.filePath = file.name;
      console.log('File selected:', file);
      
      // Đọc nội dung file Excel
      const reader = new FileReader();

      // Cập nhật tiến trình đọc file
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 50); // Tính tiến trình đọc (lên đến 50%)
        }
      };

      reader.onload = async (e: any) => {
        this.uploadProgress = 50; // Hoàn thành đọc file (50%)
        const data = e.target.result;
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);
          
          // Lấy danh sách các sheet
          this.excelSheets = workbook.worksheets.map(sheet => sheet.name);
          console.log('Available sheets:', this.excelSheets);
          
          // Nếu có sheet, chọn sheet đầu tiên và đọc dữ liệu
          if (this.excelSheets.length > 0) {
            this.selectedSheet = this.excelSheets[0];
            await this.readExcelData(workbook, this.selectedSheet);
          }
        } catch (error) {
          console.error('Error reading Excel file:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể đọc file Excel!',
            showConfirmButton: true,
            timer: 1500
          });
        }

        // Reset giá trị của input file để cho phép chọn lại cùng file
        input.value = '';

      };
      reader.readAsArrayBuffer(file);
    }
  }

  async readExcelData(workbook: ExcelJS.Workbook, sheetName: string) {
    try {
      const worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        throw new Error('Sheet không tồn tại');
      }

      // Đọc dữ liệu từ sheet
      const data: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        // Bỏ qua 2 hàng đầu tiên (hàng tiêu đề)
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
          
          // Kiểm tra kỹ hơn để loại bỏ các dòng tiêu đề
          const isHeaderRow = 
            rowData.CodeRTC === 'Mã RTC' || 
            rowData.CodeRTC === 'CodeRTC' ||
            rowData.CodeNCC === 'Mã' ||
            rowData.CodeNCC === 'CodeNCC' ||
            rowData.NameNCC === 'Tên' ||
            !rowData.CodeRTC && !rowData.CodeNCC;

          // Chỉ thêm vào data nếu không phải là dòng tiêu đề và có dữ liệu
          if (!isHeaderRow && (rowData.CodeRTC || rowData.CodeNCC || rowData.NameRTC || rowData.NameNCC)) {
            data.push(rowData);
          }
        }
      });

      // Cập nhật dữ liệu vào bảng
      this.dataTableExcel = data;
      if (this.tableExcel) {
        this.tableExcel.replaceData(this.dataTableExcel);
      } else {
        this.drawTable(); // Khởi tạo bảng nếu chưa có
      }

    } catch (error) {
      console.error('Error reading Excel data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể đọc dữ liệu từ sheet!',
        showConfirmButton: true,
        timer: 1500
      });
    }
  }

  // Thêm phương thức để xử lý khi sheet thay đổi
  onSheetChange() {
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
          } catch (error) {
            console.error('Error reading Excel file:', error);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  saveExcelData() {
    console.log('--- Bắt đầu saveExcelData ---');

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

    console.log('dataTableExcel (dữ liệu từ Excel):', this.dataTableExcel);

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
        // Đảm bảo existingProducts là một mảng từ cấu trúc response của backend
        const existingProducts = (response.data && Array.isArray(response.data.existingProducts)) ? response.data.existingProducts : [];
        console.log('existingProducts (sau khi xử lý response):', existingProducts);
        
        // Chuyển đổi dữ liệu từ Excel sang định dạng phù hợp
        const processedData = this.dataTableExcel.map((row, index) => {
          // Tìm sản phẩm đã tồn tại trong database
          const existingProduct = existingProducts.find((p: any) => 
            p.CodeRTC === row.CodeRTC && p.CodeNCC === row.CodeNCC // Tìm kiếm chính xác theo cả hai mã
          );

          const assignedId = existingProduct ? existingProduct.ID : 0;

          console.log(`Xử lý hàng ${index}:`, { 
            rowFromExcel: row, 
            foundExisting: existingProduct, 
            assignedId: assignedId 
          });

          return {
            id: assignedId, // Sử dụng ID từ database nếu có
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

        // Gửi dữ liệu đã xử lý lên API (từng sản phẩm một)
        let successCount = 0;
        let errorCount = 0;
        const totalProducts = processedData.length;
        let completedRequests = 0;

        // Reset tiến trình cho phần gửi API
        this.uploadProgress = 50;

        if (totalProducts === 0) {
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
          console.log(`Gửi lưu sản phẩm ${index}:`, product);
          this.lstVPP.adddata(product).subscribe({
            next: (response) => {
              console.log(`Response từ adddata cho sản phẩm ${index}:`, response);
              if (response.status === 1) {
                successCount++;
              } else {
                errorCount++;
                console.error(`Lỗi khi lưu sản phẩm ${index}:`, response.message);
              }

              completedRequests++;
              // Cập nhật tiến trình dựa trên số lượng request hoàn thành
              this.uploadProgress = 50 + Math.round((completedRequests / totalProducts) * 50); // Tính tiến trình gửi API (từ 50% đến 100%)

              // Kiểm tra xem tất cả các request đã hoàn thành chưa
              if (completedRequests === totalProducts) {
                console.log('--- Tất cả các request adddata đã hoàn thành ---');
                this.showSaveSummary(successCount, errorCount, totalProducts);
              }
            },
            error: (err) => {
              errorCount++;
              console.error(`Lỗi khi lưu sản phẩm ${index}:`, err);

              completedRequests++;
               // Cập nhật tiến trình dựa trên số lượng request hoàn thành
              this.uploadProgress = 50 + Math.round((completedRequests / totalProducts) * 50); // Tính tiến trình gửi API (từ 50% đến 100%)

              // Kiểm tra xem tất cả các request đã hoàn thành chưa
              if (completedRequests === totalProducts) {
                console.log('--- Tất cả các request adddata đã hoàn thành ---');
                this.showSaveSummary(successCount, errorCount, totalProducts);
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
    this.uploadProgress = 0; // Reset tiến trình về 0 sau khi hoàn thành
  }

  // Hàm helper để lấy ID của đơn vị tính từ tên
  private getUnitIdByName(unitName: string): number {
    const unit = this.listUnit.find(u => u.Name === unitName);
    return unit ? unit.ID : 0;
  }

  closeExcelModal() {
    const modalEl = document.getElementById('ExcelModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    // Reset các biến
    this.filePath = '';
    this.excelSheets = [];
    this.selectedSheet = '';
    this.dataTableExcel = [];
    
    // Cập nhật lại bảng Tabulator để hiển thị dữ liệu rỗng
    if (this.tableExcel) {
      this.tableExcel.replaceData(this.dataTableExcel);
    }
  }
}