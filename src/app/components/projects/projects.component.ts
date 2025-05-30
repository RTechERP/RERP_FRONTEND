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
import { ProjectService } from './project-service/project.service';
import { FormsModule } from '@angular/forms';
import { ProjectFormComponent } from './project-form/project-form.component';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import moment from 'moment';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ProjectFormPriorityComponent } from './project-form-priority/project-form-priority.component';
import { ProjectWorkerSyntheticComponent } from './project-worker-synthetic/project-worker-synthetic.component';
import { Router } from '@angular/router';
import { ProjectChangeComponent } from './project-change/project-change.component';
import { ProjectStatusComponent } from './project-status/project-status.component';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, RouterModule, NgSelectModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  //Khai báo các biến
  project: any[] = [];
  projectTypes = [];
  users = [];
  pms = [];
  businessFields = [];
  customers = [];
  projecStatuses = [];

  // Khai báo các bảng
  tb_projects: any;
  tb_projectTypeLinks: any;
  tb_projectitems: any;
  selectedProjectTypeIds: number[] = [];
  selectedProjecStatusIds: string[] = [];
  selectedUser: any;
  selectedPm: any;
  selectedBusinessField: any;
  selectedTechnical: any;
  selectedCustomer: any;
  searchText: string = '';

  dateS: string = moment(Date.now())
    .subtract(1, 'years')
    .set({ hour: 0, minute: 0, second: 0 })
    .format('YYYY-MM-DD');
  dateE: string = moment(Date.now())
    .set({ hour: 23, minute: 59, second: 59 })
    .format('YYYY-MM-DD');

  constructor(
    private projectService: ProjectService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit() {
    // Vẽ bảng khi load chương trình
    this.onLoadTableProject();
    this.onLoadTableProjectTypeLinks();
    this.onLoadTableProjectitems();

    this.getProjectStatus();
    this.getCustomers();
    this.getBusinessFields();
    this.getPMs();
    this.getUsers();
    this.getProjectTypes();

    this.getProjectItems(0);
    this.getProjectTypeLinks(0);
  }

  // Các hàm cho Main

  onLoadTableProject() {
    if (this.tb_projects) this.tb_projects.destroy();
    const rowMenu = [
      {
        label: `<span style="font-size: 0.75rem;"><i class="fas fa-chart-bar"></i> Mức độ ưu tiên cá nhân</span>`,
        menu: [1, 2, 3, 4, 5].map((level) => ({
          label: `<span style="font-size: 0.75rem;">${level}</span>`,
          action: (e: any, row: any) => {
            this.openEditProjectPersonalPriority(level);
          },
        })),
      },
      {
        label:
          '<span style="font-size: 0.75rem;"><i class="fas fa-file-excel"></i> Xuất excel</span>',
        action: (e: any, row: any) => {
          this.exportExcel();
        },
      },
      {
        label:
          '<span style="font-size: 0.75rem;"><i class="fas fa-chart-simple"></i> Tổng hợp nhân công</span>',
        action: (e: any, row: any) => {
          this.openProjectWorkerPriority();
        },
      },
      {
        label:
          '<span style="font-size: 0.75rem;"><i class="fas fa-list-ul"></i> Danh sách báo cáo công việc</span>',
        action: (e: any, row: any) => {
          this.openProjectListWorkReport();
        },
      },
      {
        label:
          '<span style="font-size: 0.75rem;"><i class="fas fa-circle-half-stroke"></i> Trạng thái dự án</span>',
        action: (e: any, row: any) => {
          this.openProjectStatus();
        },
      },
      {
        label:
          '<span style="font-size: 0.75rem;"><i class="fas fa-recycle"></i> Chuyển dự án</span>',
        action: (e: any, row: any) => {
          this.changeProject();
        },
      },
    ];

    this.tb_projects = new Tabulator(`#tb_projects`, {
      height: '54vh',
      layout: 'fitDataFill',
      rowHeader: {
        width: 20,
        headerSort: false,
        resizable: false,
        frozen: true,
        headerHozAlign: 'center',
        hozAlign: 'center',
        formatter: 'rowSelection',
      },
      pagination: true,
      paginationMode: 'remote',
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 40, 80, 100],
      ajaxURL: this.projectService.getAPIProjects(),
      ajaxParams: this.getProjectAjaxParams(),
      ajaxResponse: function (url, params, res) {
        return {
          data: res.data,
          last_page: 5,
        };
      },
      rowContextMenu: rowMenu,
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
      locale: 'vi',
      columns: [
        {
          title: 'Trạng thái',
          field: 'ProjectStatusName',
          hozAlign: 'left',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || 'Kết thúc';
            return value;
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày tạo',
          field: 'CreatedDate',
          width: 100,
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày cập nhật',
          field: 'UpdatedDate',
          width: 100,
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Mức độ ưu tiên',
          field: 'PriotityText',
          hozAlign: 'right',
          headerHozAlign: 'center',
        },
        {
          title: 'Mức độ ưu tiên cá nhân',
          field: 'PersonalPriotity',
          hozAlign: 'right',
          headerHozAlign: 'center',
        },
        {
          title: 'Mã dự án',
          field: 'ProjectCode',
          hozAlign: 'left',
          bottomCalc: 'count',
          headerHozAlign: 'center',
        },
        {
          title: 'Tên dự án',
          field: 'ProjectName',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'End User',
          field: 'EndUserName',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        { title: 'PO', field: 'PO', hozAlign: 'center' },
        {
          title: 'Ngày PO',
          field: 'PODate',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Người phụ trách(sale)',
          field: 'FullNameSale',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'Người phụ trách(kỹ thuật)',
          field: 'FullNameTech',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'PM',
          field: 'FullNamePM',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'Lĩnh vực dự án',
          field: 'BussinessField',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'Hiện trạng',
          field: 'CurrentState',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'Khách hàng',
          field: 'CustomerName',
          hozAlign: 'left',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày bắt đầu dự kiến',
          field: 'PlanDateStart',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc dự kiến',
          field: 'PlanDateEnd',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày bắt đầu thực tế',
          field: 'ActualDateStart',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc thực tế',
          field: 'ActualDateEnd',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Người tạo',
          field: 'Người tạo',
          headerHozAlign: 'center',
          hozAlign: 'left',
        },
        {
          title: 'Người sửa',
          field: 'UpdatedBy',
          headerHozAlign: 'center',
          hozAlign: 'left',
        },
      ],
    });

    this.tb_projects.on('rowClick', (e: any, row: any) => {
      this.tb_projects.deselectRow();
      row.select();

      var rowData = row.getData();
      this.getProjectItems(rowData['ID']);
      this.getProjectTypeLinks(rowData['ID']);
    });
  }

  getProjectAjaxParams() {
    debugger;
    const projectTypeStr =
      this.selectedProjectTypeIds?.length > 0
        ? this.selectedProjectTypeIds.join(',')
        : '';

    const projectStatusStr =
      this.selectedProjecStatusIds?.length > 0
        ? this.selectedProjecStatusIds.join(',')
        : '';
    return {
      dateTimeS: moment(this.dateS)
        .set({ hour: 0, minute: 0, second: 0 })
        .format('YYYY-MM-DD HH:mm:ss'),
      dateTimeE: moment(this.dateE)
        .set({ hour: 23, minute: 59, second: 59 })
        .format('YYYY-MM-DD HH:mm:ss'),
      keywword: this.searchText ?? '',
      customerID: this.selectedCustomer ?? 0,
      saleID: this.selectedUser ?? 0,
      projectType: projectTypeStr,
      leaderID: this.selectedTechnical ?? 0,
      userTechID: 0,
      pmID: this.selectedPm ?? 0,
      globalUserID: this.projectService.GlobalEmployeeId,
      bussinessFieldID: this.selectedBusinessField ?? 0,
      projectStatus: projectStatusStr,
    };
  }

  onLoadTableProjectitems() {
    if (this.tb_projectitems) this.tb_projectitems.destroy();

    this.tb_projectitems = new Tabulator(`#tb_projectitems`, {
      height: '27vh',
      selectableRows: 1,
      layout: 'fitDataFill',
      locale: 'vi',
      columns: [
        {
          title: 'STT',
          field: 'STT',
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        { title: 'Mã', field: 'Code', headerHozAlign: 'center' },
        {
          title: 'Trạng thái',
          field: 'StatusText',
          hozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Kiểu hạng mục',
          field: 'ProjectTypeName',
          hozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Người phụ trách',
          field: 'FullName',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
        { title: '%', field: 'PercentItem', headerHozAlign: 'center' },
        { title: 'Công việc', field: 'Mission', headerHozAlign: 'center' },
        {
          title: 'Người giao việc',
          field: 'EmployeeRequest',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày bắt đầu dự kiến',
          field: 'PlanStartDate',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Tổng số ngày',
          field: 'TotalDayPlan',
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc dự kiến',
          field: 'PlanEndDate',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày bắt đầu thực tế',
          field: 'ActualStartDate',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc thực tế',
          field: 'ActualEndDate',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            value = moment(value).isValid()
              ? moment(value).format('DD/MM/YYYY')
              : '';
            return value;
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Ghi chú',
          field: 'Note',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Người tham gia',
          field: 'ProjectEmployeeName',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
        {
          title: '% Thực tế',
          field: 'PercentageActual',
          hozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
          headerHozAlign: 'center',
        },
      ],
      initialSort: [{ column: 'STT', dir: 'asc' }],
    });
  }

  onLoadTableProjectTypeLinks() {
    if (this.tb_projectTypeLinks) this.tb_projectTypeLinks.destroy();
    this.tb_projectTypeLinks = new Tabulator(`#tb_projectTypeLinks`, {
      height: '27vh',
      dataTree: true,
      dataTreeStartExpanded: true,
      layout: 'fitColumns',
      locale: 'vi',
      columns: [
        {
          title: 'Chọn',
          field: 'Selected',
          headerHozAlign: 'center',
          // formatter: function (cell, formatterParams, onRendered) {
          //   const checked = cell.getValue() ? 'checked' : '';
          //   return `<input type='checkbox' ${checked} disable/>`;
          // },
          formatter: 'tickCross',
        },
        {
          title: 'Kiểu dự án',
          field: 'ProjectTypeName',
          headerHozAlign: 'center',
        },
        { title: 'Leader', field: 'FullName', headerHozAlign: 'center' },
      ],
    });
  }

  getProjects() {
    debugger;
    this.tb_projects.setData(
      this.projectService.getAPIProjects(),
      this.getProjectAjaxParams()
    );
  }

  getProjectItems(id: number) {
    this.projectService.getProjectItems(id).subscribe({
      next: (response: any) => {
        this.tb_projectitems.setData(response.data);
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectTypeLinks(id: number) {
    this.projectService.getProjectTypeLinks(id).subscribe({
      next: (response: any) => {
        console.log('projectlink', response.data);
        this.tb_projectTypeLinks.setData(
          this.projectService.setDataTree(response.data)
        );
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectTypes() {
    this.projectService.getProjectTypes().subscribe({
      next: (response: any) => {
        this.projectTypes = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getUsers() {
    this.projectService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getPMs() {
    this.projectService.getPMs().subscribe({
      next: (response: any) => {
        this.pms = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getBusinessFields() {
    this.projectService.getBusinessFields().subscribe({
      next: (response: any) => {
        this.businessFields = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getCustomers() {
    this.projectService.getCustomers().subscribe({
      next: (response: any) => {
        this.customers = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectStatus() {
    this.projectService.getProjectStatus().subscribe({
      next: (response: any) => {
        this.projecStatuses = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  deletedProjects() {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length <= 0) {
      Swal.fire(
        'Thông báo!',
        'Vui lòng chọn ít nhất 1 dự án để xóa!',
        'warning'
      );
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc muốn xóa dự án đã chọn?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        // Gọi API xóa dự án
        this.projectService.deletedProject(selectedIDs).subscribe({
          next: (response: any) => {
            Swal.fire('Thông báo!', `${response.data}`, 'success');
            this.getProjects();
          },
          error: (error) => {
            console.error('Lỗi:', error);
          },
        });
      }
    });
  }

  // Các hàm mở modal

  openAddProjectModal() {
    const modalRef = this.modalService.open(ProjectFormComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.projectId = 0;
  }

  openEditProjectModal() {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length != 1) {
      Swal.fire('Thông báo!', 'Vui lòng chọn 1 dự án để sửa!', 'warning');
      return;
    }

    const modalRef = this.modalService.open(ProjectFormComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.projectId = selectedIDs[0];
  }

  async exportExcel() {
    const table = this.tb_projects;
    if (!table) return;

    const data = table.getData();
    if (!data || data.length === 0) {
      Swal.fire('Thông báo!', 'Không có dữ liệu để xuất!', 'warning');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách dự án');

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
    link.download = `DanhSachDuAn.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }

  openEditProjectPersonalPriority(priority: number) {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length <= 0) {
      Swal.fire('Thông báo!', 'Vui lòng chọn dự án!', 'warning');
      return;
    }

    const dataSave = {
      ProjectIDs: selectedIDs,
      UserID: this.projectService.GlobalEmployeeId,
      Priotity: priority,
    };
    this.projectService.saveProjectPersonalPriority(dataSave).subscribe({
      next: (response: any) => {
        if (response.data == true) {
          Swal.fire('Thông báo!', 'Đã thay đổi ưu tiên cá nhân!', 'success');
          this.getProjects();
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });

    // const modalRef = this.modalService.open(ProjectPersonalPriorityComponent, {
    //   centered: true,
    //   size: 'sm',
    //   backdrop: 'static',
    //   keyboard: false,
    // });

    // modalRef.componentInstance.projectId = selectedIDs[0];

    // modalRef.result.catch((reason) => {
    //   if (reason == true) {
    //     this.getProjects();
    //     this.getProjectItems(0);
    //     this.getProjectTypeLinks(0);
    //   }
    // });
  }

  openProjectWorkerPriority() {
    // let selectedRows = this.tb_projects.getSelectedRows();
    // let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    // if (selectedIDs.length != 1) {
    //   Swal.fire('Thông báo!', 'Vui lòng chọn 1 dự án!', 'warning');
    //   return;
    // }

    this.router.navigate(['/projectWorkerSynthetic']);
  }

  openProjectListWorkReport() {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length != 1) {
      Swal.fire('Thông báo!', 'Vui lòng chọn 1 dự án!', 'warning');
      return;
    }

    this.router.navigate(['/projectListWorkReport', selectedIDs[0]]);
  }

  changeProject() {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length != 1) {
      Swal.fire('Thông báo!', 'Vui lòng chọn 1 dự án cần chuyển!', 'warning');
      return;
    }

    const modalRef = this.modalService.open(ProjectChangeComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.projectIdOld = selectedIDs[0];
    modalRef.componentInstance.disable = false;

    modalRef.result.catch((reason) => {
      if (reason == true) {
        this.getProjects();
      }
    });
  }

  openProjectStatus() {
    let selectedRows = this.tb_projects.getSelectedRows();
    let selectedIDs = selectedRows.map((row: any) => row.getData().ID);

    if (selectedIDs.length != 1) {
      Swal.fire('Thông báo!', 'Vui lòng chọn 1 dự án!', 'warning');
      return;
    }

    const modalRef = this.modalService.open(ProjectStatusComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });
    debugger;
    modalRef.componentInstance.projectId = selectedIDs[0] ?? 0;

    modalRef.result.catch((reason) => {
      if (reason == true) {
        this.getProjects();
      }
    });
  }
}
