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
  selector: 'app-project-change',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-change.component.html',
  styleUrl: './project-change.component.css',
})
export class ProjectChangeComponent implements OnInit {
  @Input() projectIdOld: any;
  @Input() reportIds: any[] = [];
  projects: any;
  projectIdNew: any;
  disable: any = false;

  ngOnInit(): void {
    this.getProjectModal();
  }
  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService
  ) {}

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

  saveChange() {
    if (this.disable == true) {
      this.saveProjectWorkReport();
    } else {
      this.saveChangeProject();
    }
  }

  saveProjectWorkReport() {
    if (this.projectIdNew <= 0 || !this.projectIdNew) {
      Swal.fire('Thông báo!', 'Vui lòng chọn đến dự án!', 'warning');
      return;
    }

    const dataSave = {
      ProjectIDOld: this.projectIdOld,
      ProjectIDNew: this.projectIdNew,
      reportIDs: this.reportIds,
    };

    this.projectService.saveProjectWorkReport(dataSave).subscribe({
      next: (response: any) => {
        if (response.data == true) {
          Swal.fire('Thông báo!', 'Đã chuyển dự án!', 'success');
          this.activeModal.dismiss(true);
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  saveChangeProject() {
    if (this.projectIdOld <= 0 || !this.projectIdOld) {
      Swal.fire('Thông báo!', 'Vui lòng chọn từ dự án!', 'warning');
      return;
    }
    if (this.projectIdNew <= 0 || !this.projectIdNew) {
      Swal.fire('Thông báo!', 'Vui lòng chọn đến dự án!', 'warning');
      return;
    }

    if (this.projectIdNew == this.projectIdOld) {
      Swal.fire(
        'Thông báo!',
        'Hai mã dự án giống nhau. Vui lòng kiểm tra lại!!',
        'warning'
      );
      return;
    }

    this.projectService
      .saveChangeProject(this.projectIdOld, this.projectIdNew)
      .subscribe({
        next: (response: any) => {
          if (response.data == true) {
            Swal.fire('Thông báo!', 'Đã chuyển dự án!', 'success');
            this.activeModal.dismiss(true);
          }
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
  }
}
