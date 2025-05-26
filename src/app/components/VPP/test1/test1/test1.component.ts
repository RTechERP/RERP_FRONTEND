import { Component, OnInit } from '@angular/core';
import{Test1ServiceService} from '../test1-service.service';
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
  selector: 'app-test1',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, SweetAlert2Module],
  templateUrl: './test1.component.html',
  styleUrl: './test1.component.css'
})
export class Test1Component implements OnInit {
  lstVP: any[] = [];
  listUnit: any[] = [];
  table: any; // instance của Tabulator
  dataTable: any[] = [];
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

  typeOptions = [
    { id: 2, name: 'Dùng chung' },
    { id: 1, name: 'Cá nhân' }
  ];



  constructor(private lstVPP: Test1ServiceService ){ }

  ngOnInit(): void {
    this.drawTable();
    this.getAll();
    this.getUnits();
  }

//lấy ra danh sách đơn vị tính
  getUnits(): void {
    this.lstVPP.getUnit().subscribe({
      next: (res) => {
        console.log('Danh sách đơn vị tính:', res);
        this.listUnit = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn vị tính:', err);
      }
    });
  }

  private drawTable(): void {
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
  }

  //lấy ra dữ liệu
  getAll(): void {
    this.lstVPP.getdata(this.searchText).subscribe({
      next: (res) => {
        console.log('Dữ liệu nhận được:', res);
        this.lstVP = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

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
    this.lstVPP.nextCodeRTC().subscribe({
      next: (res) => {
        console.log('Response từ nextCodeRTC:', res);
        this.newProduct = {
          CodeRTC: res,
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

  async exportToExcel() {
    // Tạo một workbook (file Excel) mới
    const workbook = new ExcelJS.Workbook();
    // Tạo một worksheet (sheet) mới với tên "Danh sách VPP"
    const worksheet = workbook.addWorksheet('Danh sách VPP');

    // Định nghĩa các tiêu đề cột
    const headers = [
      'Mã RTC',
      'Mã NCC', 
      'Tên (RTC)',
      'Tên (NCC)',
      'Đơn vị tính',
      'Giá (VND)',
      'Định mức',
      'Loại'
    ];

    // Thêm và định dạng hàng tiêu đề
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      // Đặt màu nền cho tiêu đề (màu xanh)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      };
      // Đặt font chữ đậm và màu trắng
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      // Căn giữa nội dung
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
    });

    // Lấy dữ liệu từ bảng và thêm vào Excel
    const data = this.table.getData();
    data.forEach((item: any) => {
      // Thêm từng dòng dữ liệu
      worksheet.addRow([
        item.CodeRTC,
        item.CodeNCC,
        item.NameRTC,
        item.NameNCC,
        item.Unit,
        item.Price,
        item.RequestLimit,
        item.TypeName
      ]);
    });

    // Tự động điều chỉnh độ rộng cột
    worksheet.columns.forEach((column: any) => {
      let maxLength = 0;
      // Tìm độ dài lớn nhất trong các ô của cột
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      // Đặt độ rộng cột (tối thiểu 10, cộng thêm 2 để có khoảng trống)
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Định dạng các ô dữ liệu
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Bỏ qua hàng tiêu đề
        row.eachCell((cell: any) => {
          // Căn giữa theo chiều dọc, căn phải cho cột giá tiền
          cell.alignment = {
            vertical: 'middle',
            horizontal: cell.col === 6 ? 'right' : 'left'
          };
          
          // Định dạng số cho cột giá tiền (thêm dấu phân cách hàng nghìn)
          if (cell.col === 6) {
            cell.numFmt = '#,##0';
          }
        });
      }
    });

    // Tạo file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    // Tạo blob từ buffer
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    // Lưu file với tên DanhSachVPP.xlsx
    saveAs(blob, 'DanhSachVPP.xlsx');
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

  importFromExcel(): void {
    // TODO: Implement Excel import functionality
    Swal.fire({
      icon: 'info',
      title: 'Thông báo',
      text: 'Tính năng đang được phát triển!',
    });
  }
}
