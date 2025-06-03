import { Component, OnInit } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { PositionServiceService } from '../position-service/position-service.service';

@Component({
  selector: 'app-position-internal',
  templateUrl: './position-internal.component.html',
  styleUrls: ['./position-internal.component.css'],
  imports: [CommonModule, FormsModule, NgSelectModule]
})
export class PositionInternalComponent implements OnInit {

  private tabulator!: Tabulator;
  positionInternal: any[] = [];
  isEditMode: boolean = false;
  selectedPositionInternal: any = null;
  positionInternalData = {
    ID: 0,
    PriorityOrder: 0,
    Code: '',
    Name: '',
    IsBusinessCost: false,
  }

  constructor(private positionService: PositionServiceService) { }

  ngOnInit() {
    this.initializeTable();
    this.loadPositionInternal();
  }

  loadPositionInternal() {
    this.positionService.getPositionInternal().subscribe((data: any) => {
      this.positionInternal = data;
      this.initializeTable();
    })
  }

  private initializeTable(): void {
    this.tabulator = new Tabulator('#position-internal-table', {
      data: this.positionInternal,
      layout: 'fitDataFill',
      selectableRows: true,
      rowHeader: { formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, width: 50, frozen: true, headerHozAlign: "center", hozAlign: "center" },
      responsiveLayout: true,
      height: '80vh',
      rowContextMenu: [
        {
          label: 'Có hưởng CTP',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            console.log(position);
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = position['PriorityOrder'];
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = true;
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Không hưởng CTP',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            console.log(position);
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = position['PriorityOrder'];
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = false;
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 1',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 1;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 2',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 2;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 3',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 3;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 4',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 4;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 5',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 5;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 6',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 6;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 7',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 7;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 8',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 8;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 9',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 9;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 10',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionInternalData.ID = position['ID'];
            this.positionInternalData.PriorityOrder = 10;
            this.positionInternalData.Code = position['Code'];
            this.positionInternalData.Name = position['Name'];
            this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionInternal();
            });
          }
        },
        {
          label: 'Khác',
          menu: [
            ...Array.from({ length: 10 }, (_, i) => ({
              label: `Mức độ ưu tiên ${i + 11}`,
              action: () => {
                const selectedRows = this.tabulator.getSelectedRows();
                if (selectedRows.length === 0) {
                  Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần cập nhật");
                  return;
                }
                const position = selectedRows[0].getData();
                this.positionInternalData.ID = position['ID'];
                this.positionInternalData.PriorityOrder = i + 11;
                this.positionInternalData.Code = position['Code'];
                this.positionInternalData.Name = position['Name'];
                this.positionInternalData.IsBusinessCost = position['IsBusinessCost'];
                this.positionService.savePositionInternal(this.positionInternalData).subscribe(() => {
                  Swal.fire("Thành công", "Cập nhật thành công", "success");
                  this.loadPositionInternal();
                });
              }
            }))
          ]
        }

      ],
      columns: [
        { title: 'Mức độ ưu tiên', field: 'PriorityOrder', hozAlign: 'right', headerHozAlign: 'center', width: '17vw' },
        { title: 'Mã chức vụ', field: 'Code', hozAlign: 'left', headerHozAlign: 'center', width: '25vw' },
        { title: 'Tên chức vụ', field: 'Name', hozAlign: 'left', headerHozAlign: 'center', width: '37vw' },
        {
          title: 'Hưởng CTP',
          field: 'IsBusinessCost',
          hozAlign: 'center',
          headerHozAlign: 'center',
          formatter: 'tickCross',
          formatterParams: {
            allowEmpty: true,
            allowTruthy: true,
            tickElement: '<i class="fas fa-check"></i>',
            crossElement: ''
          }
        },
      ]
    })
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedPositionInternal = null;
    this.positionInternalData = {
      ID: 0,
      PriorityOrder: 0,
      Code: '',
      Name: '',
      IsBusinessCost: false,
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addPositionInternalModal'));
    modal.show();
  }

  openEditModal() {
    this.isEditMode = true;
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần sửa");
      return;
    }
    this.selectedPositionInternal = selectedRows[0].getData();
    console.log(this.selectedPositionInternal);
    this.positionInternalData = {
      ID: this.selectedPositionInternal.ID,
      PriorityOrder: this.selectedPositionInternal.PriorityOrder,
      Code: this.selectedPositionInternal.Code,
      Name: this.selectedPositionInternal.Name,
      IsBusinessCost: this.selectedPositionInternal.IsBusinessCost
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addPositionInternalModal'));
    modal.show();
  }

  openDeleteModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn chức vụ nội bộ cần xóa");
      return;
    }
    const idsToDelete = selectedRows.map(row => row.getData()['ID']);
    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa ${idsToDelete.length} chức vụ nội bộ đã chọn?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(idsToDelete.map(id =>
          this.positionService.deletePositionInternal(id).toPromise()
        )).then(() => {
          Swal.fire("Thành công", "Đã xóa thành công các chức vụ nội bộ đã chọn", "success");
          this.loadPositionInternal();
        }).catch(() => {
          Swal.fire("Thất bại", "Có lỗi xảy ra khi xóa", "error");
        });
      }
    });
  }
  onSubmit(form: any) {
    if (form.invalid) {
      Swal.fire("Thông báo", "Vui lòng điền đầy đủ thông tin trước khi lưu", "warning");
      return;
    }
    if (this.isEditMode) {
      this.positionService.savePositionInternal(this.positionInternalData).subscribe({
        next: (response) => {
          this.closeModal();
          Swal.fire("Thành công", "Chức vụ nội bộ đã được cập nhật thành công", "success");
          this.loadPositionInternal();
        },
        error: (response) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Cập nhật chức vụ nội bộ thất bại: ' + response.error.message,
            icon: 'error'
          });
        }
      });
    } else {
      this.positionService.savePositionInternal(this.positionInternalData).subscribe({
        next: (response) => {
          this.closeModal();
          Swal.fire({
            title: 'Thành công',
            text: 'Chức vụ nội bộ đã được thêm mới thành công',
            icon: 'success'
          });
          this.loadPositionInternal();
        },
        error: (response) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Thêm mới chức vụ nội bộ thất bại: ' + response.error.message,
            icon: 'error'
          });
        }
      });
    }
  }

  closeModal() {
    const modal = document.getElementById('addPositionInternalModal');
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal).hide();
    }
  }

}
