import { Component, OnInit } from '@angular/core';
import { OfficeSupplyRequestSummaryServiceService } from '../OfficeSupplyRequestSummaryService/office-supply-request-summary-service.service';
import { ColumnCalcsModule, Tabulator } from 'tabulator-tables';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-office-supply-request-summary',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './office-supply-request-summary.component.html',
  styleUrl: './office-supply-request-summary.component.css'
})
export class OfficeSupplyRequestSummaryComponent implements OnInit {
  datatable: any[] = [];
  table: Tabulator | undefined;
  dataDeparment: any[] = [];
  searchParams = {
    year: new Date().getFullYear(),
    month: new Date().getMonth()+1,
    departmentId: 0,
    keyword: ''
  };
  constructor(private officeSupplyRequestSummaryService: OfficeSupplyRequestSummaryServiceService) { }

  ngOnInit(): void {      
    this.getdataDeparment();
    this.drawTable();
    this.getdataOfficeSupplyRequestSummary();
  }
  search(): void {
      this.getdataOfficeSupplyRequestSummary();
  }
  getdataOfficeSupplyRequestSummary(): void {
    this.officeSupplyRequestSummaryService.getdataOfficeSupplyRequestSummary(
      this.searchParams.departmentId,
      this.searchParams.year, 
      this.searchParams.month,  
      this.searchParams.keyword
    ).subscribe({
      next: (res) => {
        this.datatable = res.data;
        console.log('Danh sách VPP:', this.datatable);
        if (this.table) {
          console.log('Cập nhật dữ liệu bảng');
          this.table.setData(this.datatable).then(() => {
            console.log('Dữ liệu đã được cập nhật');
          }).catch(error => {
            console.error('Lỗi khi cập nhật dữ liệu:', error);
          });
        } else {
          console.warn('Bảng chưa được khởi tạo');
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu:', err);
      }
    });
  }

  getdataDeparment(): void {
    this.officeSupplyRequestSummaryService.getdataDepartment().subscribe({
      next: (res) => {     
        if (res && Array.isArray(res.data)) {
          this.dataDeparment = res.data;
        } else {
          this.dataDeparment = [];
          console.warn("Phản hồi không chứa danh sách");
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn vị tính:', err);
      }
    });
  }
  exportToExcel() {
    const now = new Date();
    const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    
    if (this.table) {
      this.table.download('xlsx', `TongHopVPP_T${this.searchParams.month}/${this.searchParams.year}_${dateStr}.xlsx`, { sheetName: 'Báo cáo VPP' });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Bảng chưa được khởi tạo!',
      });
    }
  }

  private drawTable(): void {
    try {
      if (!this.table) {
        // Create reusable formatters
        const quantityFormatter = function(cell: any) {
          return cell.getValue() == 0 ? "" : cell.getValue(); 
        };

        const moneyFormatterParams = {
          precision: 0,
          decimal: ".",
          thousand: ",",
          symbol: "",
          symbolAfter: true
        };
        

        this.table = new Tabulator("#office-supply-request-summary-table", {
          data: this.datatable,
          height: '80vh',
          layout: "fitDataFill",
          pagination: true,
          paginationSize: 50,
          movableColumns: true,
          resizableRows: true,
          
          columnDefaults:{
            // headerWordWrap: true,
            headerVertical: false,
            headerHozAlign: "center",           
            minWidth: 60,
            headerFilter:true,
            resizable: true,
           
          },
          columns: [
            { 
              title: "",
              frozen:true,
              columns:[
                { title: "STT", field: "STT", width: 45, hozAlign: "center", resizable: true
                  //  frozen: true 
                  },
                { 
                  title: "Tên sản phẩm", 
                  field: "OfficeSupplyName", 
                  width: 400,
                  resizable: true,
                  variableHeight: true,
                  bottomCalc: "count",
                  // frozen: true
                },
              ]
            },
            {
              title: "Số lượng", 
              columns: [
                { title: "Ban giám đốc", field: "GD", hozAlign: "right", width: 65, resizable: true, sorter:"number",headerFilterParams:{"tristate":true},
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "HCNS", field: "HR", hozAlign: "right", width: 60, resizable: true, 
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Kế toán", field: "KT", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Mua hàng", field: "MH", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Phòng Marketing", field: "MKT", hozAlign: "right", width: 65, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Kinh doanh", field: "KD", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Kỹ thuật", field: "KYTHUAT", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Cơ khí- Thiết kế", field: "TKCK", hozAlign: "right", width: 65, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "AGV", field: "AGV", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Văn Phòng BN", field: "BN", hozAlign: "right", width: 65, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Văn Phòng HP", field: "HP", hozAlign: "right", width: 65, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
                { title: "Văn Phòng HCM", field: "HCM", hozAlign: "right", width: 65, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter, formatter: quantityFormatter },
              ],
            },
            {
              title: "",
              columns: [
                { title: "Tổng", field: "TotalQuantity", hozAlign: "right", width: 60, resizable: true,
                  bottomCalc:"sum", bottomCalcFormatter: quantityFormatter },
                { 
                  title: "Đơn giá (VND)", 
                  field: "UnitPrice", 
                  width: 88,
                  resizable: true,
                  hozAlign: "right",
                  formatter: "money",
                  formatterParams: moneyFormatterParams,
                  bottomCalcFormatterParams: moneyFormatterParams
                },
                
                { 
                  title: "Thành tiền (VND)", 
                  field: "TotalPrice", 
                  width: 90,
                  resizable: true,
                  hozAlign: "right",
                  formatter: "money",
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
                { 
                  title: "Ghi chú", 
                  field: "Note", 
                  width: 120,
                  resizable: true,
                  formatter: "textarea",
                  variableHeight: true
                },
              ],
            },
          ],
        });
        console.log('Bảng đã được khởi tạo');
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo bảng:', error);
    }
  }
} 
