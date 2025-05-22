// UnitManagement.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitService } from './UnitService/Unit.service';
import { TabulatorFull as Tabulator, RowComponent } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-UnitManagement',
  templateUrl: './UnitManagement.component.html',
  styleUrls: ['./UnitManagement.component.css']
})
export class UnitManagementComponent implements OnInit {
  unit: any[] = [];
  table: Tabulator | null = null;

  // modal chung add/edit
  action: 'add' | 'edit' = 'add';
  modalTitle = '';
  newUnitName = '';
  editingUnitId: number | null = null;

  constructor(private unitService: UnitService) { }

  ngOnInit() {
    this.loadUnits();
  }

  private loadUnits() {
    this.unitService.getUnit().subscribe((res: any) => {
      this.unit = res.data;
      this.drawTable();
    });
  }

  private drawTable() {
    if (this.table) {
      this.table.setData(this.unit);
    } else {
      this.table = new Tabulator('#datatableunit', {
        data: this.unit,
     layout: "fitDataFill",
        pagination: true,
        selectableRows: 1,
        height: '50vh',
        movableColumns: true,
        paginationSize: 15,
        paginationSizeSelector: [5, 10, 20, 50, 100],
        reactiveData: true,
        placeholder: 'Không có dữ liệu',
        dataTree: true,
        addRowPos: "bottom",          //when adding a new row, add it to the top of the table
        history: true,  
        columns: [
          // cột chọn hàng tương tự AssetsManagement
          {
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            
            headerSort: false,
            width: 50
          },
          { title: 'Mã đơn vị', field: 'ID', hozAlign: 'center', width: 80 },
          { title: 'Tên đơn vị', field: 'UnitName' },
        ],
        rowClick: (e: MouseEvent, row: RowComponent) => {
          this.table!.getSelectedRows().forEach(r => r.deselect());
          row.select();
        },
      } as any);
    }
  }

  openUnitModal(mode: 'add' | 'edit', unit?: any) {
    this.action = mode;
    if (mode === 'add') {
      this.modalTitle = 'Thêm đơn vị tính';
      this.newUnitName = '';
      this.editingUnitId = null;
    } else {
      this.modalTitle = 'Sửa đơn vị tính';
      this.editingUnitId = unit.ID;
      this.newUnitName = unit.UnitName;
    }
    const el = document.getElementById('unitModal')!;
    new bootstrap.Modal(el).show();
  }

  onEditClick() {
    if (!this.table) return alert('Chưa khởi tạo bảng!');
    const rows = this.table.getSelectedRows();
    if (!rows.length) return alert('Chọn 1 đơn vị để sửa.');
    const data = rows[0].getData();
    this.openUnitModal('edit', data);
  }

  saveUnit() {
    const name = this.newUnitName.trim();
    if (!name) return alert('Tên đơn vị không được trống!');
    const payload: any = { UnitName: name };
    if (this.action === 'edit' && this.editingUnitId != null) {
      payload.ID = this.editingUnitId;
    }
    this.unitService.SaveUnit(payload)
      .subscribe(() => this.afterUnitChange());
  }

  private afterUnitChange() {
    this.loadUnits();
    const el = document.getElementById('unitModal')!;
    bootstrap.Modal.getInstance(el)!.hide();
  }
}
