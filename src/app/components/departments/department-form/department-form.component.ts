import { Component } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { DepartmentServiceService } from '../department-service/department-service.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-department-form',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.css'
})
export class DepartmentFormComponent implements OnInit {
  private tabulator!: Tabulator;
  departments: any[] = [];
  isEditMode: boolean = false;
  selectedDepartmentId: number = 0;
  selectedDepartment: any = null;
  toastMessage: string = '';
  isSuccess: boolean = false;
  employeeList: any[] = [];
  headofdepartment: any = null;

  department = {
    ID: 0,
    STT: 0,
    Code: '',
    Name: '',
    Status: 1,
    Email: '',
    HeadofDepartment: null,
  };

  constructor(private departmentService: DepartmentServiceService) { }

  ngOnInit(): void {
    this.initializeTable();
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments() {
    this.departmentService.getDepartments().subscribe((data: any) => {
      this.departments = data.data;
      this.departments = this.departments.map((item, index) => ({
        ...item,
        STT: index + 1
      }));
      this.initializeTable();
    });
  }

  loadEmployees() {
    this.departmentService.getEmployees().subscribe({
      next: (data) => {
        this.employeeList = data.data;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  private initializeTable(): void {
    this.tabulator = new Tabulator('#department-table', {
      data: this.departments,
      layout: 'fitColumns',
      responsiveLayout: true,
      selectableRows: 1,
      height: '100%',
      columns: [
        { title: 'STT', field: 'STT', hozAlign: 'center', headerHozAlign: 'center', width: 100},
        { title: 'Mã phòng ban', field: 'Code', hozAlign: 'center', headerHozAlign: 'center', width: 400},
        { title: 'Tên phòng ban', field: 'Name', hozAlign: 'center', headerHozAlign: 'center' },
        { 
          title: 'Trạng thái', 
          field: 'Status', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: (cell) => {
            const value = cell.getValue();
            switch(value) {
              case 0: return 'Ngừng hoạt động';
              case 1: return 'Hoạt động';
              default: return value;
            }
          }
        },
      ]
    });
  }
  
  openAddModal() {
    this.isEditMode = false;
    const nextSTT = this.departments.length > 0 
      ? Math.max(...this.departments.map(item => item.STT)) + 1 
      : 1;
    
    this.department = {
      ID: 0,
      STT: nextSTT,
      Code: '',
      Name: '',
      Status: 1,
      Email: '',
      HeadofDepartment: null,
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addDepartmentModal'));
    modal.show();
  }

  openEditModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      this.showNotification('Vui lòng chọn phòng ban cần sửa', false);
      return;
    }
    this.isEditMode = true;
    this.selectedDepartment = selectedRows[0].getData();
    this.department = {
      ID: this.selectedDepartment.ID,
      STT: this.selectedDepartment.STT,
      Code: this.selectedDepartment.Code,
      Name: this.selectedDepartment.Name,
      Status: this.selectedDepartment.Status,
      Email: this.selectedDepartment.Email,
      HeadofDepartment: this.selectedDepartment.HeadofDepartment,
    };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addDepartmentModal'));
    modal.show();
  }

  openDeleteModal() {
    const selectedRows = this.tabulator.getSelectedRows();
    if (selectedRows.length === 0) {
      this.showNotification('Vui lòng chọn phòng ban cần xóa', false);
      return;
    }
    this.selectedDepartmentId = selectedRows[0].getData()['ID'];
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa phòng ban này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteDepartment();
      }
    });
  }

  deleteDepartment() {
    this.departmentService.deleteDepartment(this.selectedDepartmentId).subscribe({
      next: (response) => {
        this.loadDepartments();
        Swal.fire({
          title: 'Thành công',
          text: 'Phòng ban đã được xóa thành công',
          icon: 'success'
        });
      },
      error: (response) => {
        Swal.fire({
          title: 'Thất bại',
          text: 'Xóa phòng ban thất bại: ' + response.error.message,
          icon: 'error'
        });
      }
    });
  }

  onSubmit(form: any) {
    if (form.valid) {
      if (this.isEditMode) {
        this.departmentService.updateDepartment(this.department).subscribe({
          next: (response) => {
            this.closeModal();
            this.loadDepartments();
            Swal.fire({
              title: 'Thành công',
              text: 'Cập nhật phòng ban thành công',
              icon: 'success'
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Thất bại',
              text: 'Cập nhật phòng ban thất bại: ' + error.message,
              icon: 'error'
            });
          }
        });
      } else {
        this.departmentService.createDepartment(this.department).subscribe({
          next: (response) => {
            this.closeModal();
            this.loadDepartments();
            Swal.fire({
              title: 'Thành công',
              text: 'Thêm phòng ban thành công',
              icon: 'success'
            });
          },
          error: (response) => {
            Swal.fire({
              title: 'Thất bại',
              text: 'Thêm phòng ban thất bại: ' + response.error.message,
              icon: 'error'
            });
          }
        });
      }
    }
  }

  
  closeModal() {
    const modal = document.getElementById('addDepartmentModal');
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal).hide();
    }
  }

  showNotification(message: string, isSuccess: boolean) {
    this.toastMessage = message;
    this.isSuccess = isSuccess;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
  }
  
  

}
