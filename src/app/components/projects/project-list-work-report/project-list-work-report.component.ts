import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import moment from 'moment';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { ProjectService } from '../project-service/project.service';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { ProjectChangeComponent } from '../project-change/project-change.component';

@Component({
  selector: 'app-project-list-work-report',
  imports: [CommonModule, RouterModule, NgSelectModule, FormsModule],
  templateUrl: './project-list-work-report.component.html',
  styleUrl: './project-list-work-report.component.css',
})
export class ProjectListWorkReportComponent implements OnInit {
  projects: any;
  projectId: any;
  keyword: any;
  totalTime: any = 0;

  tb_projectlistworkreport: any;
  constructor(
    private projectService: ProjectService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projectId = params.get('id');
      this.onLoadTableProjectWorkerPriority();
      this.getProjectModal();
    });
  }

  onLoadTableProjectWorkerPriority() {
    if (this.tb_projectlistworkreport) this.tb_projectlistworkreport.destroy();
    this.tb_projectlistworkreport = new Tabulator(`#tb_projectlistworkreport`, {
      height: '81vh',
      layout: 'fitDataFill',
      locale: 'vi',
      pagination: true,
      paginationMode: 'remote',
      paginationSize: 1000,
      paginationSizeSelector: [1000, 1500, 2000, 2500, 3000],
      rowHeader: {
        width: 20,
        headerSort: false,
        resizable: false,
        frozen: true,
        headerHozAlign: 'center',
        hozAlign: 'center',
        formatter: 'rowSelection',
      },
      ajaxURL: this.projectService.getProjectWorkReport(),
      ajaxParams: this.getProjectWorkerReportParam(),
      ajaxResponse: (url, params, res) => {
        const ttime = res.data.reduce((sum: number, row: any) => {
          const hours = parseFloat(row.TotalHours);
          return sum + (isNaN(hours) ? 0 : hours);
        }, 0);

        this.totalTime = ttime / 8;
        const totalPage = res.data.length > 0 ? res.data[0].TotalPage : 1;
        return {
          data: res.data,
          last_page: totalPage,
        };
      },
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
      footerElement: `<div id="totalDate"> Tổng số ngày ${this.totalTime}</div>`,
      columns: [
        {
          title: 'Họ tên',
          field: 'FullName',
          headerHozAlign: 'center',
          frozen: true,
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Phòng ban',
          field: 'DepartmentName',
          headerHozAlign: 'center',
          frozen: true,
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Ngày',
          field: 'DateReport',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          frozen: true,
        },
        {
          title: 'Nội dung',
          field: 'Content',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          bottomCalc: 'count',
          bottomCalcFormatter: (cell) => {
            const count = cell.getValue();
            return count > 0 ? `Số báo cáo = ${count}` : '';
          },
        },
        {
          title: 'Số giờ',
          field: 'TotalHours',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          hozAlign: 'right',
          bottomCalc: 'sum',
        },
        {
          title: 'Kết quả',
          field: 'Results',
          headerHozAlign: 'center',
          bottomCalcFormatter: (cell) => {
            // const count = cell.getValue();
            return `Tổng số ngày = ${this.totalTime}`;
          },
        },
        {
          title: 'Vấn đề phát sinh',
          field: 'Problem',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Giải pháp',
          field: 'ProblemSolve',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Tồn đọng',
          field: 'Backlog',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Ghi chú',
          field: 'Note',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
      ],
    });

    this.tb_projectlistworkreport.on('renderComplete', () => {
      this.setTotalDay();
    });
  }

  getProjectModal() {
    this.projectService.getProjectModal().subscribe({
      next: (response: any) => {
        this.projects = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  setTotalDay() {
    debugger;
    const totalDateEl = document.getElementById('totalDate');
    if (totalDateEl) {
      totalDateEl.textContent = `Tổng số ngày ${this.totalTime ?? 0}`;
    }
  }

  getProjectWorkerReportParam() {
    return {
      projectId: this.projectId ?? 0,
      keyword: this.keyword ?? '',
    };
  }

  getProjectWorkReport() {
    this.tb_projectlistworkreport.setData(
      this.projectService.getProjectWorkReport(),
      this.getProjectWorkerReportParam()
    );
  }

  async exportToExcelAdvanced() {
    const table = this.tb_projectlistworkreport;
    if (!table) return;

    const data = table.getData();
    if (!data || data.length === 0) {
      Swal.fire('Thông báo!', 'Không có dữ liệu để xuất!', 'warning');
      return;
    }

    const projectCode = this.projects.find(
      (p: any) => p.ID === this.projectId
    )?.ProjectCode;
    if (!projectCode) {
      Swal.fire('Thông báo!', 'Vui lòng chọn dự án cần xuất excel!', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách báo cáo công việc');

    const columns = table.getColumns();
    // Bỏ qua cột đầu tiên
    const filteredColumns = columns.slice(1);
    const headers = filteredColumns.map(
      (col: any) => col.getDefinition().title
    );
    worksheet.addRow(headers);

    data.forEach((row: any) => {
      const rowData = filteredColumns.map((col: any) => {
        const field = col.getField();
        let value = row[field];

        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          value = new Date(value);
        }

        return value;
      });

      worksheet.addRow(rowData);
    });

    // Format cột có giá trị là Date
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // bỏ qua tiêu đề
      row.eachCell((cell, colNumber) => {
        if (cell.value instanceof Date) {
          cell.numFmt = 'dd/mm/yyyy'; // hoặc 'yyyy-mm-dd'
        }
      });
    });

    // Tự động căn chỉnh độ rộng cột
    worksheet.columns.forEach((column: any) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length + 2);
      });
      column.width = maxLength;
    });

    // Thêm bộ lọc cho toàn bộ cột (từ A1 đến cột cuối cùng)
    worksheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: 1,
        column: filteredColumns.length,
      },
    };

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const formattedDate = new Date()
      .toISOString()
      .slice(2, 10)
      .split('-')
      .reverse()
      .join('');

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${projectCode}_${formattedDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }

  changeProject() {
    let selectedRows = this.tb_projectlistworkreport.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (this.projectId <= 0) {
      Swal.fire('Thông báo!', 'Vui lòng chọn dự án!', 'warning');
      return;
    }

    if (selectedIDs.length <= 0) {
      Swal.fire(
        'Thông báo!',
        'Vui lòng chọn hạng mục cần chuyển dự án!',
        'warning'
      );
      return;
    }

    const modalRef = this.modalService.open(ProjectChangeComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.projectIdOld = this.projectId;
    modalRef.componentInstance.reportIds = selectedIDs;
    modalRef.componentInstance.disable = true;

    modalRef.result.catch((reason) => {
      if (reason == true) {
        this.getProjectWorkReport();
      }
    });
  }
}
