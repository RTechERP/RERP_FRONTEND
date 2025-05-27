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
    private modalService: NgbModal
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
          hozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
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
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Mức độ ưu tiên cá nhân',
          field: 'PersonalPriotity',
          hozAlign: 'center',
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
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Người phụ trách(kỹ thuật)',
          field: 'FullNameTech',
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'PM',
          field: 'FullNamePM',
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Lĩnh vực dự án',
          field: 'BussinessField',
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Hiện trạng',
          field: 'CurrentState',
          hozAlign: 'center',
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
        { title: 'Người tạo', field: 'Người tạo', headerHozAlign: 'center' },
        { title: 'Người sửa', field: 'UpdatedBy', headerHozAlign: 'center' },
      ],
    });

    this.tb_projects.on('rowClick', (e: any, row: any) => {
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
        // this.tb_projectTypeLinks.setData(this.projectService.setDataTree(response.data));
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

  downloadExcel() {
    var columnLayout = this.tb_projects.getColumnLayout();
    let wscols = [];
    for (var i = 0; i < columnLayout.length; i++) {
      let item = columnLayout[i];
      let isDownload = item.download ?? true;
      if (!isDownload) continue;
      let size = { wch: item.width * 0.2 };
      wscols.push(size);
    }

    this.tb_projects.download('xlsx', `DanhSachDuAn.xlsx`, {
      sheetName: 'Danh sách dự án',

      documentProcessing: function (workbook: any) {
        var ws_name = workbook.SheetNames[0];
        var ws = workbook.Sheets[ws_name];

        ws['!cols'] = wscols;
        ws['!autofilter'] = { ref: 'A1:H1' };

        return workbook;
      },
    });
  }

  exportExcel() {
    debugger;
    if (this.tb_projects.getDataCount() === 0) {
      this.tb_projects.on('dataLoaded', () => {
        this.downloadExcel();
      });
    }else{
      this.downloadExcel();
    }
  }


}
