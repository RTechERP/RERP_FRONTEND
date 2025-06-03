import { Component, OnInit } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { PositionServiceService } from '../position-service/position-service.service';

@Component({
  selector: 'app-position-contract',
  templateUrl: './position-contract.component.html',
  styleUrls: ['./position-contract.component.css'],
  imports: [CommonModule, FormsModule, NgSelectModule]
})
export class PositionContractComponent implements OnInit {

  private tabulator!: Tabulator;
  positionContracts: any[] = [];
  isEditMode: boolean = false;
  selectedPositionContract: any = null;
  positionContract = {
    ID: 0,
    PriorityOrder: 0,
    Code: '',
    Name: '',
    IsBusinessCost: false,
  }

  constructor(private positionService: PositionServiceService) { }

  ngOnInit() {
    this.initializeTable();
    this.loadPositionContract();
  }

  loadPositionContract() {
    this.positionService.getPositionContract().subscribe((data: any) => {
      this.positionContracts = data;
      this.initializeTable();
    })
  }

  private initializeTable(): void {
    this.tabulator = new Tabulator('#position-contract-table', {
      data: this.positionContracts,
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
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            console.log(position);
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = position['PriorityOrder'];
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = true;
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Không hưởng CTP',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = position['PriorityOrder'];
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = false;
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 1',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 1;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 2',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 2;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 3',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 3;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 4',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 4;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 5',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 5;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 6',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 6;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 7',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 7;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 8',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 8;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 9',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 9;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
            });
          }
        },
        {
          label: 'Mức độ ưu tiên 10',
          action: () => {
            const selectedRows = this.tabulator.getSelectedRows();
            if (selectedRows.length === 0) {
              Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
              return;
            }
            const position = selectedRows[0].getData();
            this.positionContract.ID = position['ID'];
            this.positionContract.PriorityOrder = 10;
            this.positionContract.Code = position['Code'];
            this.positionContract.Name = position['Name'];
            this.positionContract.IsBusinessCost = position['IsBusinessCost'];
            this.positionService.savePositionContract(this.positionContract).subscribe(() => {
              Swal.fire("Thành công", "Cập nhật thành công", "success");
              this.loadPositionContract();
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
                  Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần cập nhật");
                  return;
                }
                const position = selectedRows[0].getData();
                this.positionContract.ID = position['ID'];
                this.positionContract.PriorityOrder = i + 11;
                this.positionContract.Code = position['Code'];
                this.positionContract.Name = position['Name'];
                this.positionContract.IsBusinessCost = position['IsBusinessCost'];
                this.positionService.savePositionContract(this.positionContract).subscribe(() => {
                  Swal.fire("Thành công", "Cập nhật thành công", "success");
                  this.loadPositionContract();
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
    this.positionContract = {
      Code: '',
      Name: '',
      PriorityOrder: 0,
      IsBusinessCost: false,
      ID: 0
    }

    const modal = new (window as any).bootstrap.Modal(document.getElementById('addPositionContractModal'));
    modal.show();
  }

  openEditModal() {
    this.isEditMode = true;
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần sửa");
      return;
    }
    this.selectedPositionContract = selectedRows[0].getData();
    this.positionContract = {
      ID: this.selectedPositionContract.ID,
      PriorityOrder: this.selectedPositionContract.PriorityOrder,
      IsBusinessCost: this.selectedPositionContract.IsBusinessCost,
      Code: this.selectedPositionContract.Code,
      Name: this.selectedPositionContract.Name,
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addPositionContractModal'));
    modal.show();
  }

  openDeleteModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn chức vụ theo hợp đồng cần xóa");
      return;
    }
    const idsToDelete = selectedRows.map(row => row.getData()['ID']);
    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa ${idsToDelete.length} chức vụ theo hợp đồng đã chọn?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(idsToDelete.map(id =>
          this.positionService.deletePositionContract(id).toPromise()
        )).then(() => {
          Swal.fire("Thành công", "Đã xóa thành công các chức vụ theo hợp đồng đã chọn", "success");
          this.loadPositionContract();
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
      this.positionService.savePositionContract(this.positionContract).subscribe({
        next: (response) => {
          this.closeModal();
          this.loadPositionContract();
          Swal.fire({
            title: 'Thành công',
            text: 'Chức vụ theo hợp đồng đã được cập nhật thành công',
            icon: 'success'
          });
        },
        error: (response) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Cập nhật chức vụ theo hợp đồng thất bại: ' + response.error.message,
            icon: 'error'
          });
        }
      });
    } else {
      this.positionService.savePositionContract(this.positionContract).subscribe({
        next: (response) => {
          this.closeModal();
          this.loadPositionContract();
          Swal.fire({
            title: 'Thành công',
            text: 'Chức vụ theo hợp đồng đã được thêm mới thành công',
            icon: 'success'
          });
        },
        error: (response) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Thêm mới chức vụ theo hợp đồng thất bại: ' + response.error.message,
            icon: 'error'
          });
        }
      });
    }
  }
  closeModal() {
    const modal = document.getElementById('addPositionContractModal');
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal).hide();
    }
  }
}






