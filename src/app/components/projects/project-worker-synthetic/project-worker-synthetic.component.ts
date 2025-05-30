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
import { ProjectChangeComponent } from '../project-change/project-change.component';

@Component({
  selector: 'app-project-worker-synthetic',
  imports: [CommonModule, RouterModule, NgSelectModule, FormsModule],
  templateUrl: './project-worker-synthetic.component.html',
  styleUrl: './project-worker-synthetic.component.css',
})
export class ProjectWorkerSyntheticComponent implements OnInit {
  projects: any;
  workerTypes: any;

  projectId: any;

  workerTypeId: any;
  keyword: any;

  tb_projectWorker: any;

  constructor(
    private projectService: ProjectService,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.onLoadTableProjectWorkerPriority();
    this.getProjectModal();
    this.getWorkerType();
    this.getProjectWorkerSynthetic();
  }

  onLoadTableProjectWorkerPriority() {
    if (this.tb_projectWorker) this.tb_projectWorker.destroy();
    this.tb_projectWorker = new Tabulator(`#tb_projectWorker`, {
      height: '81vh',
      layout: 'fitColumns',
      locale: 'vi',
      groupBy: 'TypeName',
      groupHeader: function (value, count, data, group) {
        return `Loại nhân công: ${value}`;
      },
      ajaxURL: this.projectService.getProjectWorkerSynthetic(),
      ajaxParams: this.getProjectWorkerParam(),
      columns: [
        {
          title: 'STT',
          field: 'TT',
          headerHozAlign: 'center',
        },
        { title: 'Nội dung', field: 'WorkContent', headerHozAlign: 'center' },
        {
          title: 'Tổng số người',
          field: 'AmountPeople',
          headerHozAlign: 'center',
        },
        {
          title: 'Tổng số ngày',
          field: 'NumberOfDay',
          headerHozAlign: 'center',
        },
        {
          title: 'Tổng nhân công',
          field: 'WorkForce',
          headerHozAlign: 'center',
        },
        { title: 'Tổng đơn giá', field: 'Price', headerHozAlign: 'center' },
        {
          title: 'Tổng thành tiền',
          field: 'TotalPrice',
          headerHozAlign: 'center',
        },
        {
          title: 'Loại nhân công',
          field: 'TypeName',
          headerHozAlign: 'center',
        },
      ],
    });
  }

  getProjectWorkerParam() {
    return {
      projectId: this.projectId ?? 0,
      prjWorkerTypeId: this.workerTypeId ?? 0,
      keyword: this.keyword?.trim() || '',
    };
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

  getWorkerType() {
    this.projectService.getWorkerType().subscribe({
      next: (response: any) => {
        debugger;
        this.workerTypes = response.data;
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  getProjectWorkerSynthetic() {
    this.tb_projectWorker.setData(
      this.projectService.getProjectWorkerSynthetic(),
      this.getProjectWorkerParam()
    );
  }

  downloadExcel() {
    const projectCode = this.projects.find(
      (p: any) => p.ID === this.projectId
    )?.ProjectCode;
    if (!projectCode) {
      Swal.fire('Thông báo!', 'Vui lòng chọn dự án cần xuất excel!', 'warning');
      return;
    }
    var columnLayout = this.tb_projectWorker.getColumnLayout();
    let wscols = [];
    for (var i = 0; i < columnLayout.length; i++) {
      let item = columnLayout[i];
      let isDownload = item.download ?? true;
      if (!isDownload) continue;
      let size = { wch: item.width * 0.2 };
      wscols.push(size);
    }

    this.tb_projectWorker.download(
      'xlsx',
      `TongHopNhanConguDuAn_${projectCode}.xlsx`,
      {
        sheetName: 'TongHopNhanConguDuAn',

        documentProcessing: function (workbook: any) {
          var ws_name = workbook.SheetNames[0];
          var ws = workbook.Sheets[ws_name];

          ws['!cols'] = wscols;
          ws['!autofilter'] = { ref: 'A1:H1' };

          return workbook;
        },
      }
    );
  }

  
}
