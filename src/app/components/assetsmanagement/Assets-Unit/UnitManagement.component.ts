// UnitManagement.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitService } from './UnitService/Unit.service';
import { TabulatorFull as Tabulator, RowComponent } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { ModalService } from '../assets-form/assets-formServices/asset-formservice.service';
declare var bootstrap: any;
import Swal from 'sweetalert2';

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
  selectedUnit: any = {};
  action: 'add' | 'edit' | 'delete' = 'add';


  modalTitle = '';
  newUnitName = '';
  savelist: any[] = [];
  editingUnitId: number | null = null;
  constructor(private unitService: UnitService,
    private modalservice: ModalService

  ) { }

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
        layout: "fitDataStretch",
        pagination: true,
        selectableRows: 100,
        height: '50vh',
        movableColumns: true,
        paginationSize: 20,
        paginationSizeSelector: [5, 10, 20, 50, 100],
        reactiveData: true,
        placeholder: 'Không có dữ liệu',
        dataTree: true,
        addRowPos: "bottom",
        history: true,
        columns: [
          {
            formatter: 'rowSelection',
            titleFormatter: 'rowSelection',
            hozAlign: 'center',
            headerSort: false,
            width: 50,
            headerHozAlign: 'center',
            cssClass: 'custom-checkbox-cell'
          },
          { title: 'Mã đơn vị', field: 'ID', hozAlign: 'center', width: 80 },
          { title: 'Tên đơn vị', field: 'UnitName' },
        ],
        rowClick: (e: MouseEvent, row: RowComponent) => {
          this.table!.getSelectedRows().forEach(r => r.deselect());
          row.select();
          this.selectedUnit = row.getData();
        },
      } as any);
    }
  }
  openUnitModal(mode: 'add' | 'edit' | 'delete', unit?: any) {
    this.action = mode;
    if (mode === 'add') {
      this.modalTitle = 'Thêm đơn vị tính';
      this.newUnitName = '';
      this.editingUnitId = null;
    } else if (mode === 'edit') {
      this.modalTitle = 'Sửa đơn vị tính';
      this.editingUnitId = unit.ID;
      this.newUnitName = unit.UnitName;
    } else if (mode === 'delete') {
      this.modalTitle = 'Xóa đơn vị tính';
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
  onDeleteClick() {
    if (!this.table) return alert('Chưa khởi tạo bảng!');
    const rows = this.table.getSelectedRows();
    if (rows.length === 0) return alert('Chọn 1 đơn vị để xóa.');
    const data = rows[0].getData()
    this.action = 'delete';
    this.editingUnitId = data['ID'];
    this.newUnitName = data['UnitName'];
        this.saveUnit(true);
  }
  saveUnit(isDelete: boolean = false) {
    if (!this.newUnitName.trim() && !isDelete) {
      Swal.fire('Lỗi', 'Tên đơn vị không được để trống!', 'error');
      return;
    }
    const unit = {
      ID: (this.action === 'edit' || this.action === 'delete') ? this.editingUnitId : 0,
      UnitName: this.newUnitName.trim(),
      IsDeleted: isDelete
    };
    this.unitService.SaveData([unit]).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: isDelete
            ? 'Xóa đơn vị thành công!'
            : this.action === 'add'
              ? 'Thêm đơn vị thành công!'
              : 'Cập nhật đơn vị thành công!'
        });
        this.loadUnits();
        const modalEl = document.getElementById('unitModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        modal?.hide();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể lưu dữ liệu. Vui lòng thử lại.'
        });
      }
    });
  }

}
