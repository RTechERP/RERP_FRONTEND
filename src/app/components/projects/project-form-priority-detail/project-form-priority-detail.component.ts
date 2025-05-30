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
  selector: 'app-project-form-priority-detail',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-form-priority-detail.component.html',
  styleUrl: './project-form-priority-detail.component.css',
})
export class ProjectFormPriorityDetailComponent implements OnInit {
  @Input() priorityId: any = 0;
  prioritys: any;

  points = [
    { point: 0, ID: 0 },
    { point: 1, ID: 1 },
    { point: 2, ID: 2 },
    { point: 3, ID: 3 },
    { point: 4, ID: 4 },
    { point: 5, ID: 5 },
  ];

  point: any;
  priority: any;
  priorityCode: any;
  projectCheckpoint: any;
  rate: any;

  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService
  ) {}
  ngOnInit(): void {
    this.getPriorityType();
    this.getProjectPriorityDetail();
  }

  getPriorityType() {
    this.projectService.getPriorityType().subscribe({
      next: (response: any) => {
        this.prioritys = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectPriorityDetail() {
    this.projectService.getprojectprioritydetail(this.priorityId).subscribe({
      next: (response: any) => {
        const dt = response.data;
        if (dt) {
          this.point = dt.Score;
          this.priority = dt.ParentID;
          this.priorityCode = dt.Code;
          this.projectCheckpoint = dt.ProjectCheckpoint;
          this.rate = dt.Rate;
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  saveProjectPriority() {
    if (!this.priorityCode || this.priorityCode.trim() === '') {
      Swal.fire('Thông báo!', `Vui lòng nhập Mã ưu tiên!`, 'warning');
      return;
    }

    if (!this.priority) {
      Swal.fire('Thông báo!', `Vui lòng chọn Loại ưu tiên!`, 'warning');
      return;
    }

    if (!this.projectCheckpoint || this.projectCheckpoint.trim() === '') {
      Swal.fire('Thông báo!', `Vui lòng nhập Checkpoint!`, 'warning');
      return;
    }

    if (!this.rate) {
      Swal.fire('Thông báo!', `Vui lòng nhập Trọng số!`, 'warning');
      return;
    }
    if (!this.point) {
      Swal.fire('Thông báo!', `Vui lòng chọn điểm!`, 'warning');
      return;
    }
    if (!this.priority) {
      Swal.fire('Thông báo!', `Vui lòng chọn Loại ưu tiên!`, 'warning');
      return;
    }

    const pattern = /^[a-zA-Z0-9_-]+$/;

    if (!pattern.test(this.priorityCode.trim())) {
      Swal.fire(
        'Thông báo!',
        'Mã ưu tiên không được chứa kí tự tiếng Việt và khoảng trắng!',
        'warning'
      );
      return;
    }

    this.projectService
      .checkProjectPriority(this.priorityId, this.priorityCode)
      .subscribe({
        next: (response: any) => {
          debugger
          if (response.data == false) {
            const dataSave = {
              ID: this.priorityId,
              Code: this.priorityCode,
              ProjectCheckpoint: this.projectCheckpoint,
              Rate: this.rate,
              Score: this.point,
              ParentID: this.priority,
            };
            this.projectService.saveprojectpriority(dataSave).subscribe({
              next: (response: any) => {
                Swal.fire(
                  'Thông báo!',
                  'Ưu tiên đã được lưu!',
                  'success'
                );
                this.activeModal.dismiss(true);
              },
              error: (error) => {
                console.error('Lỗi:', error);
              },
            });
          } else {
            Swal.fire(
              'Thông báo!',
              'Mã ưu tiên đã tồn tại vui lòng kiểm tra lại!',
              'warning'
            );
            return;
          }
        },
        error: (error) => {
          console.error('Lỗi:', error);
        },
      });
  }

  
}
