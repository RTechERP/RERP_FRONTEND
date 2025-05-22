import { Component, OnInit } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DailyreportService } from './dailyreport-service/dailyreport.service';
import * as XLSX from 'xlsx';
(window as any).XLSX = XLSX;
import { Tabulator } from 'tabulator-tables';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dailyreport',
  standalone: true,
  imports: [NgSelectModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './dailyreport.component.html',
  styleUrls: ['./dailyreport.component.css']
})
export class DailyreportComponent implements OnInit {
  searchParams = {
    dateStart: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    dateEnd: new Date().toISOString().split('T')[0],
    employeeId: 0,
    userID:0,
    teamID:0,
    departmentId:6,
    keyword:''
  };
  table1: any;
  table2: any;
  table3: any;
  departmentId: number = 0;
  projectId: number = 0;
  dataTable1: any[] = [];
  dataTable2: any[] = [];
  dataTable3: any[] = [];
  ischeckmodeExcel: number = 0;

  dataEmployees: any[] = [];

  constructor(private dailyreportService: DailyreportService) { }

  ngOnInit(): void {
    this.getDataEmployee();
    this.getDailyReportHCNSIT();
    this.getDailyReportFilmAndDriver();
  }
  getDataEmployee(): void{
    this.dailyreportService.getdataEmployee(this.departmentId, this.projectId).subscribe({
      next: (res) => {     
        if (res?.data) {
          this.dataEmployees = Array.isArray(res.data) ? res.data : [res.data];
          console.log('Danh sách nhân viên:', this.dataEmployees);
        } else {
          this.dataEmployees = [];
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy nhân viên:', err);
        this.dataEmployees = [];
      }
    });
  }

  //Bao cao HCNS-IT
  getDailyReportHCNSIT(): void {
    try {
      const dateStart = this.searchParams.dateStart ? new Date(this.searchParams.dateStart) : new Date();
      const dateEnd = this.searchParams.dateEnd ? new Date(this.searchParams.dateEnd) : new Date();
      const departmentId = this.departmentId || 0;
      const userId = this.searchParams.userID || 0;
      const keyword = this.searchParams.keyword || '';

      this.dailyreportService.getDailyReportHCNSIT(departmentId, dateStart, dateEnd, userId, keyword).subscribe({
        next: (res) => {
          console.log('Báo cáo HCNS-IT:', res);
          if(res?.data){
            this.dataTable1 = Array.isArray(res.data) ? res.data : [res.data];
            this.drawTable1();
          }else{
            this.dataTable1 = [];
            this.drawTable1();
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy báo cáo HCNS-IT:', err);
          this.dataTable1 = [];
          this.drawTable1();
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể lấy dữ liệu báo cáo. Vui lòng thử lại sau.'
          });
        }
      });
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
      this.dataTable1 = [];
      this.drawTable1();
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại sau.'
      });
    }
  }

  private drawTable1(): void{
    if(this.table1){
      this.table1.replaceData(this.dataTable1);
    }else{
      this.table1 = new Tabulator("#table_dailyreportHCNSIT", {
        data: this.dataTable1,
        layout: "fitDataFill",
        height: '50vh',
        pagination:true,
        paginationSize: 30,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        columns: [
          {title: "Họ tên", field: "FullName", hozAlign: "left"},
          {title: "Chức vụ", field: "PositionName",hozAlign: "left"},
          {title: "Ngày", field: "DateReport",hozAlign: "center",
            formatter: (cell) => {
              const value = cell.getValue();
              if (!value) return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          },
          {title: "Nội dung", field: "Content",hozAlign: "left"},
          {title: "Kết quả", field: "Results",hozAlign: "left"},
          {title: "Kế hoạch ngày tiếp theo", field: "PlanNextDay",hozAlign: "left"},
          {title: "Tồn đọng", field: "Backlog",hozAlign: "left"},
          {title: "Lý do tồn đọng", field: "BacklogReason",hozAlign: "left"},
          {title: "Vấn đề phát sinh", field: "Problem",hozAlign: "left"},
          {title: "Giải pháp", field: "ProblemSolve",hozAlign: "left"},
          {title: "Ngày tạo", field: "CreatedDate",hozAlign: "center",
            formatter: (cell) => {
              const value = cell.getValue();
              if (!value) return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          }
        ]
      });
    }
  }

  //Báo cáo cắt phim
  getDailyReportFilmAndDriver(): void{
    const dateStart = new Date(this.searchParams.dateStart);
    const dateEnd = new Date(this.searchParams.dateEnd);
    this.dailyreportService.getDailyReportFilmAndDriver(dateStart, dateEnd, this.searchParams.keyword, this.searchParams.employeeId).subscribe({
      next: (res) => {
        console.log('Báo cáo cắt phim:', res);
        if(res?.dataFilm){
          this.dataTable2 = Array.isArray(res.dataFilm) ? res.dataFilm : [res.dataFilm ];
          this.dataTable3 = Array.isArray(res.dataDriver) ? res.dataDriver : [res.dataDriver ];
          this.drawTable2();
          this.drawTable3();
        }else{
          this.dataTable2 = [];
          this.drawTable2();
          this.dataTable3 = [];
          this.drawTable3();
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy báo cáo cắt phim:', err);
      }
    });
  }
  private drawTable2(): void{
    if(this.table2){
      this.table2.replaceData(this.dataTable2);
    }else{
      this.table2 = new Tabulator("#table_dailyreportCP", {
        data: this.dataTable2,
        layout: "fitDataFill",
        height: '70vh',
        pagination:true,
        paginationSize: 30,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true,
        columns: [
          {title: "Họ tên", field: "FullName", hozAlign: "left"},
          {title: "Ngày", field: "DateReport",hozAlign: "left", 
            formatter: (cell) => {
            const value = cell.getValue();
            if (!value) return '';
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          }},
          {title: "Đầu mục", field: "FilmName",hozAlign: "left"},
          {title: "Nội dung công việc", field: "WorkContent",hozAlign: "right"},
          {title: "ĐVT", field: "UnitName",hozAlign: "right"},
          {title: "Năng suất trung bình(phút/đơn vị sản phẩm)", field: "PerformanceAVG",hozAlign: "right"},
          {title: "Kế quả thực hiện", field: "Quantity",hozAlign: "right"},
          {title: "Thời gian thực hiện (Phút)", field: "TimeActual",hozAlign: "right"},
          {title: "Năng suất thực tế (Phút/đơn vị sản phẩm)", field: "PerformanceActual",hozAlign: "right"},
          {title: "Năng suất trung bình/ Năng suất thực tế", field: "Percentage",hozAlign: "right"},         
          {title: "Ngày tạo", field: "CreatedDate",hozAlign: "center", 
            formatter: (cell) => {
            const value = cell.getValue();
            if (!value) return '';
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          }}
        ]
      });
    }
  }
  setCheckModeExcel(mode: number): void{
    this.ischeckmodeExcel = mode;
  }

  exportToExcel() {
    const now = new Date();
    const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    
    if(this.ischeckmodeExcel == 0 && this.table1){
      this.table1.download('xlsx', `BaoCaoHCNSIT_${dateStr}.xlsx`, { sheetName: 'Báo cáo HCNS-IT' });
    } else if (this.ischeckmodeExcel == 1 && this.table2) {
      this.table2.download('xlsx', `BaoCaoCP_${dateStr}.xlsx`, { sheetName: 'Báo cáo cắt phim' });
    } else if (this.ischeckmodeExcel == 2 && this.table3) {
      this.table3.download('xlsx', `BaoCaoLX_${dateStr}.xlsx`, { sheetName: 'Báo cáo lái xe' });
    } else {
      console.warn('Bảng chưa được khởi tạo');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Bảng chưa được khởi tạo!',
      });
    }
  }
  search(): void {
    this.ngOnInit();
  }

  //Báo cáo lái xe
  private drawTable3(): void{
    if(this.table3){
      this.table3.replaceData(this.dataTable3);
    }else{
      this.table3 = new Tabulator("#table_dailyreportLX", {
        data: this.dataTable3,
        layout: "fitDataFill",
        height: '70vh',
        pagination:true,
        paginationSize: 30,
        movableColumns: true,
        resizableRows: true,
        reactiveData: true, 
        columns: [
          {title: "Họ tên", field: "FullName", hozAlign: "left"},
          {title: "Ngày", field: "DateReport",hozAlign: "left",
            formatter: (cell) => {
              const value = cell.getValue();
              if (!value) return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          },
          {title: "Lý do muộn", field: "ReasonLate",hozAlign: "center"},
          {title: "Tình trạng xe", field: "StatusVehicle",hozAlign: "left"},
          {title: "Kiến nghị/ đề xuất", field: "Propose",hozAlign: "center"},
          {title: "Số Km", field: "KmNumber",hozAlign: "center"},
          {title: "Số Cuốc muộn", field: "TotalLate",hozAlign: "center"},
          {title: "Tổng số phút chậm", field: "TotalTimeLate",hozAlign: "center"},
          {title: "Ngày tạo", field: "CreatedDate",hozAlign: "center",
            formatter: (cell) => {
              const value = cell.getValue();
              if (!value) return '';
              const date = new Date(value);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}-${month}-${year}`;
            }
          }
        ]
      });
    }
  }
}

 