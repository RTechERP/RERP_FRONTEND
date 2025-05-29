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

@Component({
  selector: 'app-project-status',
  imports: [NgSelectModule, FormsModule],
  templateUrl: './project-status.component.html',
  styleUrl: './project-status.component.css',
})
export class ProjectStatusComponent implements OnInit {
  @Input() projectId: any = 0;
  tb_projectStatus: any;

  constructor(
    public activeModal: NgbActiveModal,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.onLoadTableProjectStatus();
    this.loadData();
  }

  onLoadTableProjectStatus() {
    if (this.tb_projectStatus) this.tb_projectStatus.destroy();
    this.tb_projectStatus = new Tabulator(`#tb_projectStatus`, {
      height: 'auto',
      layout: 'fitDataStretch',
      locale: 'vi',
      columns: [
        {
          title: '',
          field: 'Selected',
          formatter: function (cell, formatterParams, onRendered) {
            const value = cell.getValue();
            const checked = value === true ? 'checked' : '';
            return `<input type='checkbox' ${checked} />`;
          },
          cellClick: (e, cell) => {
            const newValue = !cell.getValue();
            const table = cell.getTable();
            const allRows = table.getRows();

            allRows.forEach((r) => {
              if (r !== cell.getRow()) {
                r.update({ Selected: false });
              }
            });

            cell.setValue(newValue);
          },
          hozAlign: 'center',
          width: '8vh',
          headerHozAlign: 'center',
          headerSort: false,
        },
        {
          title: 'STT',
          field: 'StatusID',
          width: '8px',
          headerHozAlign: 'center',
          hozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Trạng thái',
          field: 'StatusName',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue() || '';
            return value;
          },
        },
        {
          title: 'Ngày bắt đầu dự kiến',
          field: 'EstimatedStartDate',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue();

            // Nếu là null, undefined, object rỗng, chuỗi rỗng => trả về ''
            if (
              !value ||
              typeof value === 'object' ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              return '';
            }

            // Nếu là chuỗi ngày hợp lệ => format
            const m = moment(value);
            return m.isValid() ? m.format('DD/MM/YYYY') : '';
          },
          hozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc dự kiến',
          field: 'EstimatedEndDate',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue();

            // Nếu là null, undefined, object rỗng, chuỗi rỗng => trả về ''
            if (
              !value ||
              typeof value === 'object' ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              return '';
            }

            // Nếu là chuỗi ngày hợp lệ => format
            const m = moment(value);
            return m.isValid() ? m.format('DD/MM/YYYY') : '';
          },
          hozAlign: 'center',
        },
        {
          title: 'Ngày bắt đầu thực tế',
          field: 'ActualStartDate',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue();

            // Nếu là null, undefined, object rỗng, chuỗi rỗng => trả về ''
            if (
              !value ||
              typeof value === 'object' ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              return '';
            }

            // Nếu là chuỗi ngày hợp lệ => format
            const m = moment(value);
            return m.isValid() ? m.format('DD/MM/YYYY') : '';
          },
          hozAlign: 'center',
        },
        {
          title: 'Ngày kết thúc thực tế',
          field: 'ActualEndDate',
          headerHozAlign: 'center',
          formatter: function (cell, formatterParams, onRendered) {
            let value = cell.getValue();

            // Nếu là null, undefined, object rỗng, chuỗi rỗng => trả về ''
            if (
              !value ||
              typeof value === 'object' ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              return '';
            }

            // Nếu là chuỗi ngày hợp lệ => format
            const m = moment(value);
            return m.isValid() ? m.format('DD/MM/YYYY') : '';
          },
          hozAlign: 'center',
        },
      ],
    });
  }

  getProjectStatusParam() {
    debugger;
    return { projectId: this.projectId };
  }

  loadData() {
    debugger;
    this.projectService.getProjectStatusById(this.projectId).subscribe({
      next: (response: any) => {
        response.data = response.data.map((item: any) => ({
          ...item,
          Selected: item.Selected === true,
        }));
        this.tb_projectStatus.setData(response.data);
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }

  saveData() {
    const data: any[] = [];
    const allData = this.projectService.getSelectedRowsRecursive(
      this.tb_projectStatus.getData()
    );

    const parseNumber = (value: any): number => {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    allData.forEach((row: any) => {
      if (row['Selected'] == true || row['ID'] > 0) {
        const newRow = {
          ID: parseNumber(row['ID']),
          ProjectID: this.projectId,
          ProjectStatusID: parseNumber(row['ProjectStatusID']),

          EstimatedStartDate: moment(row['EstimatedStartDate']).isValid()
            ? moment(row['EstimatedStartDate']).format('YYYY-MM-DD')
            : null,

          EstimatedEndDate: moment(row['EstimatedEndDate']).isValid()
            ? moment(row['EstimatedEndDate']).format('YYYY-MM-DD')
            : null,

          ActualStartDate: moment(row['ActualStartDate']).isValid()
            ? moment(row['ActualStartDate']).format('YYYY-MM-DD')
            : null,

          ActualEndDate: moment(row['ActualEndDate']).isValid()
            ? moment(row['ActualEndDate']).format('YYYY-MM-DD')
            : null,

          Selected: !!row['Selected'],
          STT: parseNumber(row['StatusID']),
        };
        data.push(newRow);
      }
    });
    debugger;
    const hasSelectedRow = data.some((row) => row.Selected === true);

    if (!hasSelectedRow) {
      Swal.fire('Thông báo!', 'Vui lòng chọn 1 trạng thái!', 'warning');
      return;
    }

    this.projectService.saveProjectStatuses(data).subscribe({
      next: (response: any) => {
        if (response.data == true) {
          Swal.fire('Thông báo!', 'Lưu trạng thái thành công!', 'success');
          this.activeModal.dismiss(true);
        }
      },
      error: (error) => {
        console.error('Lỗi:', error);
      },
    });
  }
}
