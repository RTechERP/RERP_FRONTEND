import { ProjectService } from './../project-service/project.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { error } from 'jquery';
import moment from 'moment';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectFormAddStatusComponent } from '../project-form-add-status/project-form-add-status.component';
import { ProjectFormPriorityComponent } from '../project-form-priority/project-form-priority.component';

@Component({
  selector: 'app-project-form',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css',
})
export class ProjectFormComponent implements OnInit {
  @Input() projectId: any;
  projectIdSet: any;
  customers = [];
  users = [];
  statuses = [];
  pms = [];
  firmBases = [];
  projectTypeBases = [];

  projectTypes = [
    { TypeName: 'Dự án', ID: 1 },
    { TypeName: 'Thương mại', ID: 2 },
    { TypeName: 'Phim', ID: 3 },
  ];

  projectDetail: any;
  tb_ProjectUser: any;
  tb_projectTypeLinks: any;

  listPriorities: any;
  projectCode: any;
  selectedCustomer: any;
  selectedUserTech: any;
  selectedUserSale: any;
  selectedStatus: any;
  editStatus: any = 0;
  selectedPm: any;
  selectedEndUser: any;
  selectedFirmBase: any;
  selectedPrjTypeBase: any;
  selectedPrio: any;
  selectedProjectType: any = 1;
  projectContactName: any;
  projectName: any;
  note: any;
  currentState: any;
  createDate: string = moment(Date.now())
    .set({ hour: 0, minute: 0, second: 0 })
    .format('YYYY-MM-DD');

  // Ngày dự kiến
  expectedPlanDate: any;

  expectedQuotationDate: any;

  expectedPODate: any;

  expectedProjectEndDate: any;

  // Ngày thực tế
  realityPlanDate: any;

  realityQuotationDate: any;

  realityPODate: any;

  realityProjectEndDate: any;

  dateChangeStatus: any;

  // Khai báo cho cập nhật leader
  tb_projectTypeLinksMd: any;
  projectUserTeams: any[] = [];
  projectStatus: any;
  projects: any;

  selectProject: any;
  selectProjectStatus: any;
  situlator: any;
  // ------------------------------

  currentTab: string = 'tab1';

  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getProject();
    this.getFollowProjectBase();
    this.onLoadTableProjectUser();
    // this.getProjectUserModal();
    this.onLoadTableProjectTypeLinks();
    this.getProjectTypeLinkModal();
    this.getCustomersModal();
    this.getUserModal();
    this.getStatusesModal();
    this.getPmsModal();
    this.getFirmBaseModal();
    this.getProjectTypeBaseModal();

    this.onLoadTableProjectTypeLinksMd();
    this.getProjectModal();
    this.getProjectStatus();
    this.getUserTeams();
    this.loadProject();
    this.getProjectCurrentSituation();
  }

  onTabChange(tab: string) {
    this.currentTab = tab;
    if (tab == 'tab2') {
      this.projectIdSet = this.projectId;
    } else {
      this.projectId = this.projectIdSet;
    }
  }

  getCustomersModal() {
    this.projectService.getCustomers().subscribe({
      next: (response: any) => {
        this.customers = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getUserModal() {
    this.projectService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getStatusesModal() {
    this.projectService.getProjectStatus().subscribe({
      next: (response: any) => {
        this.statuses = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getPmsModal() {
    this.projectService.getPMs().subscribe({
      next: (response: any) => {
        this.pms = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getFirmBaseModal() {
    this.projectService.getFirmBases().subscribe({
      next: (response: any) => {
        this.firmBases = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectTypeBaseModal() {
    this.projectService.getProjectTypeBases().subscribe({
      next: (response: any) => {
        this.projectTypeBases = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  onLoadTableProjectTypeLinks() {
    debugger;
    if (this.tb_projectTypeLinks) this.tb_projectTypeLinks.destroy();
    this.tb_projectTypeLinks = new Tabulator(`#tb_projectTypeLinksModal`, {
      height: '26.8vh',
      dataTree: true,
      dataTreeStartExpanded: true,
      layout: 'fitColumns',
      locale: 'vi',
      columns: [
        {
          title: 'Chọn',
          field: 'Selected',
          formatter: function (cell, formatterParams, onRendered) {
            const checked = cell.getValue() ? 'checked' : '';
            return `<input type='checkbox' ${checked} />`;
          },
          cellClick: function (e, cell) {
            const newValue = !cell.getValue();
            const row = cell.getRow();
            if (row.getTreeChildren && row.getTreeChildren().length > 0) {
              const children = row.getTreeChildren();

              children.forEach((childRow) => {
                const childData = childRow.getData();
                childRow.update({ Selected: newValue });
              });
            }
            cell.setValue(newValue);
          },
          hozAlign: 'center',
          width: '20px',
          headerHozAlign: 'center',
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

  onLoadTableProjectUser() {
    if (this.tb_ProjectUser) this.tb_ProjectUser.destroy();
    this.tb_ProjectUser = new Tabulator(`#tb_ProjectUser`, {
      height: '262px',
      dataTree: true,
      dataTreeStartExpanded: true,
      layout: 'fitColumns',
      locale: 'vi',
      columns: [
        {
          title: 'Người tham gia',
          field: 'FullName',
          headerHozAlign: 'center',
        },
      ],
    });
  }

  // getProjectUserModal() {
  //   console.log(this.projectId);
  //   this.projectService.getProjectUsers(this.projectId).subscribe({
  //     next: (response: any) => {
  //       this.tb_ProjectUser.setData(
  //         this.projectService.setDataTree(response.data)
  //       );
  //     },
  //     error: (error) => {
  //       console.error('Lỗi:', error);
  //     },
  //   });
  // }

  getProjectTypeLinkModal() {
    console.log(this.projectId);
    this.projectService.getProjectTypeLinks(this.projectId).subscribe({
      next: (response: any) => {
        this.tb_projectTypeLinks.setData(
          this.projectService.setDataTree(response.data)
        );
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProject() {
    if (this.projectId > 0) {
      this.projectService.getProject(this.projectId).subscribe({
        next: (response: any) => {
          console.log(response.data);
          this.projectCode = response.data.ProjectCode;
          this.projectName = response.data.ProjectName;
          this.note = response.data.Note;
          this.selectedCustomer = response.data.CustomerID;
          this.selectedUserSale = response.data.UserID;
          this.selectedUserTech = response.data.UserTechnicalID;
          this.createDate = moment(response.data.CreatedDate)
            .set({ hour: 0, minute: 0, second: 0 })
            .format('YYYY-MM-DD');

          this.selectedStatus = response.data.ProjectStatus;
          this.editStatus = response.data.ProjectStatus;
          this.selectedPm = response.data.ProjectManager;
          this.currentState = response.data.CurrentState;
          this.selectedEndUser = response.data.EndUser;
          this.selectedPrio = response.data.Priotity;
          this.selectedProjectType =
            response.data.TypeProject <= 0 ? 1 : response.data.TypeProject;
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
    }
  }

  getFollowProjectBase() {
    if (this.projectId > 0) {
      this.projectService.getFollowProjectBases(this.projectId).subscribe({
        next: (res: any) => {
          this.selectedFirmBase = res.data.FirmBaseID;
          this.selectedPrjTypeBase = res.data.ProjectTypeBaseID;
          this.projectContactName = res.data.ProjectContactName;

          this.expectedPlanDate = res.data.ExpectedPlanDate
            ? moment(res.data.ExpectedPlanDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.expectedQuotationDate = res.data.ExpectedQuotationDate
            ? moment(res.data.ExpectedQuotationDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.expectedPODate = res.data.ExpectedPODate
            ? moment(res.data.ExpectedPODate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.expectedProjectEndDate = res.data.ExpectedProjectEndDate
            ? moment(res.data.ExpectedProjectEndDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;

          this.realityPlanDate = res.data.RealityPlanDate
            ? moment(res.data.RealityPlanDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.realityQuotationDate = res.data.RealityQuotationDate
            ? moment(res.data.RealityQuotationDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.realityPODate = res.data.RealityPODate
            ? moment(res.data.RealityPODate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
          this.realityProjectEndDate = res.data.RealityProjectEndDate
            ? moment(res.data.RealityProjectEndDate)
                .set({ hour: 0, minute: 0, second: 0 })
                .format('YYYY-MM-DD')
            : null;
        },
        error: (error) => {
          console.log('Lỗi', error);
        },
      });
    }
  }

  getProjectCode() {
    debugger;
    if (this.customers.length < 0) return;
    const customer = (this.customers as any[]).find(
      (x) => x.ID === this.selectedCustomer
    );

    if (customer.CustomerShortName == '') {
      Swal.fire(
        'Thông báo!',
        'Khách hàng đang không có tên kí hiệu. Xin vui lòng thêm thông tin tên kí hiệu!',
        'warning'
      );
      this.projectCode = '';
      return;
    }

    if (this.customers.length > 0) {
      this.projectService
        .getProjectCodeModal(
          this.projectId,
          customer.CustomerShortName,
          this.selectedProjectType
        )
        .subscribe({
          next: (response: any) => {
            this.projectCode = response.data;
            debugger;
            if (!this.selectedEndUser) {
              this.selectedEndUser = this.selectedCustomer;
            }
          },
          error: (error) => {
            console.error('Lỗi:', error);
          },
        });
    }
  }

  getDayChange() {
    debugger;
    if (this.selectedStatus == this.editStatus || this.projectId <= 0) return;

    Swal.fire({
      title:
        '<h4>Ngày thay đổi trạng thái <span style="color: red;">(*)</span> </h4>',
      html: `<input type="date" id="changeDate" class="swal2-input" style="width: auto;">`,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      showCancelButton: true,
      preConfirm: () => {
        const value = (
          document.getElementById('changeDate') as HTMLInputElement
        ).value;
        if (!value)
          return Swal.showValidationMessage('Bạn phải chọn một ngày!');
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dateChangeStatus = moment(result.value).format('YYYY-MM-DD');
      }
    });
  }

  saveDataProject() {
    debugger;
    if (this.projectId > 0) {
      this.projectService
        .checkProjectCode(this.projectId, this.projectCode)
        .subscribe({
          next: (response: any) => {
            if (response.data == 0) {
              Swal.fire(
                'Thông báo!',
                `Mã dự án đã ${this.projectCode} tồn tại. Vui lòng kiểm tra lại!`,
                'warning'
              );
              return;
            } else {
              this.save();
            }
          },
          error: (error) => {
            console.error('Lỗi:', error);
          },
        });
    } else {
      this.save();
    }
  }

  save() {
    const allData = this.tb_projectTypeLinks.getData();
    const projectUser = this.tb_ProjectUser.getData();
    const projectTypeLinks =
      this.projectService.getSelectedRowsRecursive(allData);
    if (!this.projectCode) {
      Swal.fire('Thông báo!', `Vui lòng nhập mã dự án!`, 'warning');
      return;
    }

    if (!this.projectName) {
      Swal.fire('Thông báo!', `Vui lòng nhập tên dự án!`, 'warning');
      return;
    }

    if (!this.selectedCustomer) {
      Swal.fire('Thông báo!', `Vui lòng khách hàng!`, 'warning');
      return;
    }

    if (!this.selectedUserSale) {
      Swal.fire(
        'Thông báo!',
        `Vui lòng chọn Người phụ trách(Sale)!`,
        'warning'
      );
      return;
    }

    if (!this.selectedUserTech) {
      Swal.fire(
        'Thông báo!',
        `Vui lòng chọn Người phụ trách (Technical)!`,
        'warning'
      );
      return;
    }

    if (!this.selectedPm) {
      Swal.fire('Thông báo!', `Vui lòng chọn PM!`, 'warning');
      return;
    }

    if (!this.selectedEndUser) {
      Swal.fire('Thông báo!', `Vui lòng chọn End User!`, 'warning');
      return;
    }

    if (!this.expectedPlanDate) {
      Swal.fire('Thông báo!', `Vui lòng nhập Ngày gửi phương án!`, 'warning');
      return;
    }

    if (!this.expectedQuotationDate) {
      Swal.fire('Thông báo!', `Vui lòng nhập Ngày gửi báo giá!`, 'warning');
      return;
    }

    if (projectTypeLinks.length == 0 && this.selectedProjectType <= 1) {
      Swal.fire('Thông báo!', `Vui lòng chọn kiểu dự án !`, 'warning');
      return;
    }

    if (!this.selectedPrio) {
      Swal.fire('Thông báo!', `Vui lòng nhập Mức ưu tiên!`, 'warning');
      return;
    }

    if (
      !this.dateChangeStatus &&
      this.selectedStatus != this.editStatus &&
      this.projectId > 0
    ) {
      Swal.fire({
        title:
          '<h4>Ngày thay đổi trạng thái <span style="color: red;">(*)</span> </h4>',
        html: `<input type="date" id="changeDate" class="swal2-input" style="width: auto;">`,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        showCancelButton: true,
        preConfirm: () => {
          const value = (
            document.getElementById('changeDate') as HTMLInputElement
          ).value;
          if (!value)
            return Swal.showValidationMessage('Bạn phải chọn một ngày!');
          return value;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.dateChangeStatus = moment(result.value).format('YYYY-MM-DD');
        }
      });
    }

    const dataSave: any = {
      projectStatusOld: this.editStatus ?? 0,
      project: {
        ID: this.projectId,
        ProjectCode: this.projectCode ?? '',
        ProjectName: this.projectName ?? '',
        ProjectStatus: this.selectedStatus ?? 0,
        Note: this.note ?? '',
        CustomerID: this.selectedCustomer ?? 0,
        UserID: this.selectedUserSale ?? 0,
        UserTechnicalID: this.selectedUserTech ?? 0,
        CreatedDate: this.createDate
          ? moment(this.createDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        ProjectManager: this.selectedPm ?? 0,
        CurrentState: this.currentState ?? '',
        EndUser: this.selectedEndUser ?? 0,
        Priotity: this.selectedPrio ?? 0,
        TypeProject: this.selectedProjectType ?? 0,
      },
      projectStatusLog: {
        EmployeeID: this.projectService.GlobalEmployeeId ?? 0, // ID người đăng nhập
        DateLog: this.dateChangeStatus
          ? moment(this.dateChangeStatus)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : undefined,
        CreatedBy: '',
        UpdatedBy: '',
      },
      followProjectBase: {
        ExpectedPlanDate: this.expectedPlanDate
          ? moment(this.expectedPlanDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        ExpectedQuotationDate: this.expectedQuotationDate
          ? moment(this.expectedQuotationDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        ExpectedPODate: this.expectedPODate
          ? moment(this.expectedPODate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        ExpectedProjectEndDate: this.expectedProjectEndDate
          ? moment(this.expectedProjectEndDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,

        RealityPlanDate: this.realityPlanDate
          ? moment(this.realityPlanDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        RealityQuotationDate: this.realityQuotationDate
          ? moment(this.realityQuotationDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        RealityPODate: this.realityPODate
          ? moment(this.realityPODate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,
        RealityProjectEndDate: this.realityProjectEndDate
          ? moment(this.realityProjectEndDate)
              .set({ hour: 0, minute: 0, second: 0 })
              .format('YYYY-MM-DD')
          : null,

        FirmBaseID: this.selectedFirmBase ?? 0,
        ProjectTypeBaseID: this.selectedPrjTypeBase ?? 0,
        ProjectContactName: this.projectContactName ?? '',
      },
      projectTypeLinks: projectTypeLinks ?? [], //projectTypeLinks ??
      projectUsers: projectUser ?? [], //
      listPriorities: this.listPriorities ?? [], //
    };
    console.log(dataSave);
    this.projectService.saveProject(dataSave).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.activeModal.dismiss(true);
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  openAddProjectStatusModal() {
    const modalRef = this.modalService.open(ProjectFormAddStatusComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      (result) => {
        if (result == true) {
          this.getStatusesModal();
        }
      },
      (reason) => {}
    );
  }

  // openAddProjectTypeLinkModal() {
  //   const modalRef = this.modalService.open(ProjectFormTypeLinkComponent, {
  //     backdrop: 'static',
  //     keyboard: false,
  //   });

  //   modalRef.componentInstance.projectId = this.projectId;
  //   modalRef.result.catch((reason) => {
  //     if (reason == true) {
  //       this.getProjectTypeLinkModal();
  //     }
  //   });
  // }

  openProjectPriorityModal() {
    const modalRef = this.modalService.open(ProjectFormPriorityComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.projectId = this.projectId;

    modalRef.result.catch((reason) => {
      if (reason !== undefined) {
        debugger;
        this.selectedPrio = reason.priority;
        this.listPriorities = reason.listPriorities;
      }
    });
  }

  // Code cho cập nhật leader
  onLoadTableProjectTypeLinksMd() {
    debugger;
    if (this.tb_projectTypeLinksMd) this.tb_projectTypeLinksMd.destroy();

    this.tb_projectTypeLinksMd = new Tabulator(`#tb_projectTypeLinksMd`, {
      height: '296px',
      dataTree: true,
      dataTreeStartExpanded: true,
      layout: 'fitDataStretch',
      locale: 'vi',
      columns: [
        {
          title: 'Chọn',
          field: 'Selected',
          formatter: function (cell, formatterParams, onRendered) {
            const checked = cell.getValue() ? 'checked' : '';
            return `<input type='checkbox' ${checked} />`;
          },
          cellClick: function (e, cell) {
            const newValue = !cell.getValue();
            const row = cell.getRow();
            if (row.getTreeChildren && row.getTreeChildren().length > 0) {
              const children = row.getTreeChildren();

              children.forEach((childRow) => {
                const childData = childRow.getData();
                childRow.update({ Selected: newValue });
              });
            }
            cell.setValue(newValue);
          },
          hozAlign: 'center',
          headerHozAlign: 'center',
        },
        {
          title: 'Kiểu dự án',
          field: 'ProjectTypeName',
          headerHozAlign: 'center',
        },
        {
          title: 'Leader',
          field: 'FullName',
          headerHozAlign: 'center',
          editor: 'list',
          editorParams: {
            values: this.projectUserTeams.reduce((acc: any, sup: any) => {
              acc[sup.FullName] = sup.FullName;
              return acc;
            }, {}),
            autocomplete: true,
          },
          cellEdited: (cell: any) => {
            debugger;
            const fullName = cell.getValue();
            const employee = this.projectUserTeams.find(
              (e: any) => e.FullName === fullName
            );
            if (employee) {
              const row = cell.getRow();
              row.update({ LeaderID: employee.EmployeeID });
            }
          },
        },
      ],
    });
  }

  getProjectTypeLinks() {
    this.projectService.getProjectTypeLinks(this.projectId).subscribe({
      next: (response: any) => {
        this.tb_projectTypeLinksMd.setData(
          this.projectService.setDataTree(response.data)
        );
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
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

  getProjectStatus() {
    this.projectService.getProjectStatus().subscribe({
      next: (response: any) => {
        this.projectStatus = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectCurrentSituation() {
    this.projectService
      .getProjectCurrentSituation(
        this.projectId,
        this.projectService.GlobalEmployeeId
      )
      .subscribe({
        next: (response: any) => {
          this.situlator = response.data;
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
  }

  getUserTeams() {
    this.projectService.getUserTeams().subscribe({
      next: (response: any) => {
        debugger;
        this.projectUserTeams = response.data;
        this.onLoadTableProjectTypeLinksMd();
        this.getProjectTypeLinks();
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  loadProject() {
    if (this.projectId > 0) {
      this.projectService.getProject(this.projectId).subscribe({
        next: (response: any) => {
          if (response.data) {
            this.selectProject = this.projectId;
            this.selectProjectStatus = response.data.ProjectStatus;
          }
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
    }
  }

  saveProjectTypeLink() {
    debugger;
    if (this.projectId <= 0) {
      Swal.fire('Thông báo!', `Vui lòng chọn dự án!`, 'warning');
      return;
    }

    if (this.selectProjectStatus <= 0) {
      Swal.fire('Thông báo!', `Vui lòng trạng thái dự án!`, 'warning');
      return;
    }

    const prjTypeLinks = this.projectService.getSelectedRowsRecursive(
      this.tb_projectTypeLinksMd.getData()
    );

    const dataSave = {
      ProjectID: this.projectId,
      ProjectStatus: this.selectProjectStatus,
      GlobalEmployeeId: this.projectService.GlobalEmployeeId,
      prjTypeLinks: prjTypeLinks,
      Situlator: this.situlator ?? '',
    };

    this.projectService.saveProjectTypeLink(dataSave).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          Swal.fire('Thông báo!', `Đã cập nhật Leader!`, 'success');
          this.getProjectTypeLinkModal();
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  loadAll() {
    if (this.selectProject != this.projectId)
      this.projectIdSet = this.projectId;
    this.projectId = this.selectProject;
    this.loadProject();
    this.getProjectTypeLinks();
    this.getProjectCurrentSituation();
  }

  //----------------------------------------------------------

  saveData() {
    if (this.currentTab === 'tab1') {
      console.log(1);
      this.saveDataProject();
    } else if (this.currentTab === 'tab2') {
      console.log(2);
      this.saveProjectTypeLink();
    }
  }
}
