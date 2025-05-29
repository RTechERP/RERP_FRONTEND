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

@Component({
  selector: 'app-project-form-type-link',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-form-type-link.component.html',
  styleUrl: './project-form-type-link.component.css',
})
export class ProjectFormTypeLinkComponent implements OnInit {
  @Input() projectId: any = 0;
  tb_projectTypeLinks: any;
  projectUserTeams: any[] = [];
  projectStatus: any;
  projects: any;

  selectProject: any;
  selectProjectStatus: any;
  situlator: any;

  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.onLoadTableProjectTypeLinks();
    this.getProjectModal();
    this.getProjectStatus();
    this.getUserTeams();
    this.loadProject();
    this.getProjectCurrentSituation();
  }

  onLoadTableProjectTypeLinks() {
    debugger;
    if (this.tb_projectTypeLinks) this.tb_projectTypeLinks.destroy();

    this.tb_projectTypeLinks = new Tabulator(`#tb_projectTypeLinksMd`, {
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
          width: '20px',
          headerHozAlign: 'center',
        },
        {
          title: 'Kiểu dự án',
          field: 'ProjectTypeName',
          headerHozAlign: 'center',
          width: '24px',
        },
        {
          title: 'Leader',
          field: 'FullName',
          width: '24px',
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
        this.tb_projectTypeLinks.setData(
          this.projectService.setDataTree(response.data)
        );
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

  getUserTeams() {
    this.projectService.getUserTeams().subscribe({
      next: (response: any) => {
        debugger;
        this.projectUserTeams = response.data;
        this.onLoadTableProjectTypeLinks();
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
      this.tb_projectTypeLinks.getData()
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
          Swal.fire('Thông báo!', `Lưu thành công!`, 'success');
          this.activeModal.dismiss(true);
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  loadAll() {
    if (this.selectProject != this.projectId)
      this.projectId = this.selectProject;
    this.loadProject();
    this.getProjectTypeLinks();
    this.getProjectCurrentSituation();
  }
}
