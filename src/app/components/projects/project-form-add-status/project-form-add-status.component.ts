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
  selector: 'app-project-form-add-status',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-form-add-status.component.html',
  styleUrl: './project-form-add-status.component.css',
})
export class ProjectFormAddStatusComponent implements OnInit {
  maxStt: any;
  statusName: any;
  projectStatus: any;
  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.getProjectStatus();
  }

  getProjectStatus() {
    this.projectService.getProjectStatus().subscribe({
      next: (response: any) => {
        this.projectStatus = response.data;
        if (this.projectStatus && this.projectStatus.length > 0) {
          this.maxStt =
            Math.max(...this.projectStatus.map((item: any) => item.STT || 0)) +
            1;
        } else {
          this.maxStt = 0;
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  saveProjectStatus() {
    if (!this.statusName) {
      Swal.fire('Thông báo!', `Vui lòng nhập trạng thái!`, 'warning');
      return;
    }
    debugger;
    const checkStatus = this.projectStatus.find(
      (item: any) => item.StatusName == this.statusName
    );
    if (checkStatus) {
      Swal.fire(
        'Thông báo!',
        `Trạng thái đã tồn tại. Vui lòng kiểm tra lại!`,
        'warning'
      );
      return;
    }

    this.projectService
      .saveProjectStatus(this.maxStt, this.statusName)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Đã lưu trạng thái dự án!',
              showConfirmButton: false,
              timer: 1500,
            });
            this.activeModal.dismiss(true);
          }
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
  }
}
