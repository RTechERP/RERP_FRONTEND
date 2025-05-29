import { ProjectService } from './../project-service/project.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { error } from 'jquery';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import Swal from 'sweetalert2';
import { ProjectFormPriorityDetailComponent } from '../project-form-priority-detail/project-form-priority-detail.component';

@Component({
  selector: 'app-project-form-priority',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-form-priority.component.html',
  styleUrl: './project-form-priority.component.css',
})
export class ProjectFormPriorityComponent implements OnInit {
  @Input() projectId: any = 0;
  tb_projectPriority: any;
  priorityId: any;
  selectedRow: any;
  priority: any;
  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.onLoadTableProjectTypeLinks();
    this.getProjectPriorityModal();
  }

  onLoadTableProjectTypeLinks() {
    debugger;
    if (this.tb_projectPriority) this.tb_projectPriority.destroy();
    this.tb_projectPriority = new Tabulator(`#tb_projectPriority`, {
      height: '66vh',
      dataTree: true,
      dataTreeStartExpanded: true,
      layout: 'fitDataStretch',
      locale: 'vi',
      columns: [
        {
          title: '',
          field: 'Selected',
          formatter: function (cell, formatterParams, onRendered) {
            const checked = cell.getValue() ? 'checked' : '';
            return `<input type='checkbox' ${checked} />`;
          },
          cellClick: (e, cell) => {
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

            this.caculatorPriority();
          },
          hozAlign: 'center',
          width: '8vh',
          headerHozAlign: 'center',
        },
        {
          title: 'Mã ưu tiên',
          field: 'Code',
          headerHozAlign: 'center',
          width: '10vh',
        },
        {
          title: 'Checkpoint',
          field: 'ProjectCheckpoint',
          headerHozAlign: 'center',
        },
        {
          title: 'Trọng số',
          field: 'Rate',
          headerHozAlign: 'center',
          width: '10vh',
          formatter: function (cell) {
            return (cell.getValue() * 100).toFixed(0) + ' %';
          },
          hozAlign: 'right',
        },
        {
          title: 'Điểm',
          field: 'Score',
          headerHozAlign: 'center',
          width: '8vh',
          hozAlign: 'right',
        },
        {
          title: 'Độ ưu tiên',
          field: 'Priority',
          headerHozAlign: 'center',
          hozAlign: 'right',
        },
      ],
    });

    this.tb_projectPriority.on('rowClick', (e: any, row: any) => {
      this.tb_projectPriority.deselectRow();
      this.selectedRow = row;
      row.select();

      var r = row.getData();
      this.priorityId = r['ID'];
    });
  }

  getProjectPriorityModal() {
    this.projectService.getProjectPriorityModal(this.projectId).subscribe({
      next: (response: any) => {
        debugger;
        const test = response.data.map((item: any) => ({
          ...item,
          Selected: response.checks.includes(item.ID) ? 1 : 0,
        }));
        this.tb_projectPriority.setData(
          this.projectService.setDataTree(response.data)
        );
        this.caculatorPriority();
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  savePriority() {
    if (this.priority > 5) {
      Swal.fire(
        'Thông báo!',
        'Tổng số điểm ưu tiên không được vượt quá 5!',
        'warning'
      );
      return;
    }
    Swal.fire({
      title: 'Bạn có chắc chắn muốn lưu ưu tiên dự án?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.activeModal.dismiss(this.priority);
      }
    });
  }

  caculatorPriority() {
    let totalPriority = 0;
    debugger;
    const allData = this.projectService.getSelectedRowsRecursive(
      this.tb_projectPriority.getData()
    );

    allData.forEach((row: any) => {
      if (row['Selected']) {
        totalPriority += row['Priority'];
      }
    });
    this.priority = parseFloat(totalPriority.toFixed(2));
  }

  openProjectPriorityDetailModal(num: any) {
    if ((!this.priorityId || this.priorityId <= 0) && num == 1) {
      Swal.fire('Thông báo!', 'Vui lòng chọn dòng cần sửa!', 'warning');
      return;
    }

    const modalRef = this.modalService.open(
      ProjectFormPriorityDetailComponent,
      {
        centered: true,
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
      }
    );

    if (num == 1) {
      modalRef.componentInstance.priorityId = this.priorityId;
    }

    modalRef.result.catch((reason) => {
      if (reason == true) {
        this.getProjectPriorityModal();
        this.priorityId = 0;
      }
    });
  }

  deletedProjectPriority() {
    const rowSelect: any[] = [];
    const allData = this.projectService.getSelectedRowsRecursive(
      this.tb_projectPriority.getData()
    );

    allData.forEach((row: any) => {
      if (row['Selected']) {
        rowSelect.push(row['ID']);
      }
    });

    if (rowSelect.length <= 0) {
      Swal.fire(
        'Thông báo!',
        'Vui lòng chọn ít nhất 1 dòng để xóa!',
        'warning'
      );
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc muốn xóa mã ưu tiên đã chọn?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deletedProjectPriority(rowSelect).subscribe({
          next: (response: any) => {
            if (response.data == true) {
              this.getProjectPriorityModal();
            }
          },
          error: (error) => {
            console.error('Lỗi:', error);
          },
        });
      }
    });
  }
}
