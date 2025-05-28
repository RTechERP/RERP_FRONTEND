import { Component, OnInit } from '@angular/core';
import { TeamServiceService } from '../team-service/team-service.service';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../employees/employee-service/employee.service';
import { DepartmentServiceService } from '../../departments/department-service/department-service.service';
import { EmployeeFormComponent } from '../../employees/employee-form/employee-form.component';
// import { TeamEmployeeFormComponent } from '../team-employee-form/team-employee-form.component';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.css', '../teams.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, EmployeeFormComponent]
})
export class TeamFormComponent implements OnInit {
  private teamTabulator!: Tabulator;
  private employeeTabulator!: Tabulator;
  private employeeTeamTabulator!: Tabulator;
  teamList: any[] = [];
  employeeList: any[] = [];
  employeeCombo: any[] = [];
  employeeTeamList: any[] = [];
  departmentList: any[] = [];//Biến phòng ban cho input lọc team
  departmentEmployeeList: any[] = [];//Biến phòng ban cho input lọc nhân viên
  projectTypeList: any[] = [];
  isEditMode: boolean = false;
  selectedTeamId: number = 0;
  selectedTeam: any = null;
  toastMessage: string = '';
  isSuccess: boolean = false;
  department: any = null;
  departmentEmployee: any = null;
  constructor(private teamService: TeamServiceService, private employeeService: EmployeeService, private departmentService: DepartmentServiceService) { }


  team = {
    ID: 0,
    DepartmentID: 0,
    ParentID: 0,
    Code: '',
    Name: '',
    Leader: '',
    TypeName: '',
    LeaderID: 0,
    ProjectTypeID: 0,
  }

  // Add new property for flattened team list
  flattenedTeamList: any[] = [];

  ngOnInit() {
    this.initializeTeamTable();
    this.initializeEmployeeTable();
    this.initializeEmployeeTeamTable();
    this.loadDepartments();
    this.loadTeams();
    this.loadEmployee();
    this.loadProjectType();
    // this.loadEmployeeTeam();
    this.loadDepartmentEmployee();
  }

  loadDepartments() {
    this.departmentService.getDepartments().subscribe((data: any) => {
      this.departmentList = data.data;
    });
  }

  loadDepartmentEmployee() {
    this.departmentService.getDepartments().subscribe((data: any) => {
      this.departmentEmployeeList = data.data;
    });
  }
  onDepartmentChange() {
    if (this.department) {
      this.loadTeams();
      this.loadUserTeam(this.teamList[0].ID, this.department);
    } else {
      this.teamList = [];
      this.teamTabulator.setData([]);
    }
  }

  onDepartmentEmployeeChange() {
    if (this.departmentEmployee) {
      console.log(this.departmentEmployee)
      this.loadEmployeeTeam(this.departmentEmployee, this.selectedTeam.ID);
    } else {
      this.employeeTeamList = [];
      this.employeeTeamTabulator.setData([]);
    }
  }

  loadTeams() {
    if (this.department) {
      this.teamService.getTeams(this.department).subscribe({
        next: (data: any) => {
          const flatData = data.data;
          const treeData = this.buildTreeTeam(flatData);
          this.teamList = treeData;
          this.flattenedTeamList = this.flattenTeamTree(treeData);
          this.teamTabulator.setData(this.teamList);
        },
        error: (error) => {
          console.error('Error loading teams:', error);
          this.teamList = [];
          this.flattenedTeamList = [];
          this.teamTabulator.setData([]);
        }
      });
    } else {
      this.teamService.getTeams(0).subscribe({
        next: (data: any) => {
          const flatData = data.data;
          const treeData = this.buildTreeTeam(flatData);
          this.teamList = treeData;
          this.flattenedTeamList = this.flattenTeamTree(treeData);
          this.teamTabulator.setData(this.teamList);
        },
        error: (error) => {
          console.error('Error loading teams:', error);
          this.teamList = [];
          this.flattenedTeamList = [];
          this.teamTabulator.setData([]);
        }
      });
    }
  }

  loadUserTeam(teamId: number, departmentId: number) {
    this.teamService.getUserTeam(teamId, departmentId).subscribe((data: any) => {
      const flatData = data.data;
      const treeData = this.buildTreeEmployee(flatData);
      this.employeeList = treeData;
      this.employeeTabulator.setData(this.employeeList);
    });
  }

  loadEmployee() {
    this.teamService.getEmployees().subscribe((data: any) => {
      this.employeeCombo = data.data;
      
    });
  }

  loadEmployeeTeam(departmentID:number, userTeamID: number) {
      this.teamService.getEmployeeByDepartmentID(departmentID, userTeamID).subscribe({
        next: (data: any) => {
          this.employeeTeamList = data.data;
          console.log(this.employeeTeamList);
          const treeData = this.buildTreeEmployeeTeam(this.employeeTeamList);
          this.employeeTeamList = treeData;
          this.employeeTeamTabulator.setData(this.employeeTeamList);
        },
        error: (error) => {
          console.error('Error loading employee team:', error);
          this.employeeTeamList = [];
          this.employeeTeamTabulator.setData([]);
        }
      });
  } 

  loadProjectType() {
    this.teamService.getProjectTypes().subscribe((data: any) => {
      this.projectTypeList = data.data;
    });
  }

  private buildTreeTeam(items: any[]): any[] {
    const itemMap: { [key: number]: any } = {};
    const tree: any[] = [];

    items.forEach(item => {
      itemMap[item.ID] = { ...item, children: [] };
    });

    items.forEach(item => {
      const mappedItem = itemMap[item.ID];
      if (item.ParentID === 0) {
        tree.push(mappedItem);
      } else {
        const parent = itemMap[item.ParentID];
        if (parent) {
          parent.children.push(mappedItem);
        }
      }
    });

    return tree;
  }

  private buildTreeEmployee(items: any[]): any[] {
    const teamMap: { [key: string]: any } = {};
    const tree: any[] = [];

    // First pass: create team nodes
    items.forEach(item => {
      if (!teamMap[item.Team]) {
        teamMap[item.Team] = {
          Team: item.Team,
          children: []
        };
        tree.push(teamMap[item.Team]);
      }
      // Add employee to their team
      teamMap[item.Team].children.push({
        ...item,
        children: []
      });
    });

    return tree;
  }

  private buildTreeEmployeeTeam(items: any[]): any[] {
    const teamMap: { [key: string]: any } = {};
    const tree: any[] = [];
    
    items.forEach(item => {
      // const department = this.departmentList.find(dept => dept.ID === item.DepartmentID);
      // const departmentName = department ? department.Name : 'Unknown Department';
      
      if (!teamMap[item.DepartmentName]) {
        teamMap[item.DepartmentName] = {
          DepartmentName: item.DepartmentName,
          // DepartmentName: departmentName,
          children: []
        };
        tree.push(teamMap[item.DepartmentName]);
      }
      teamMap[item.DepartmentName].children.push({
        ...item,
        children: []
      });
    });

    return tree;
  }

  private initializeTeamTable(): void {
    this.teamTabulator = new Tabulator('#team-table', {
      data: this.teamList,
      layout: 'fitColumns',
      selectableRows: true,
      height: '75vh',
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: "children",
      columns: [
        { 
          title: 'Tên nhóm', 
          field: 'Name', 
          hozAlign: 'left', 
          headerHozAlign: 'center',
          formatter: "tree" as any
        },
        { title: 'Trưởng nhóm', field: 'Leader', hozAlign: 'center', headerHozAlign: 'center',
          formatter: function(cell) {
            const value = cell.getValue();
            if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
              return '';
            }
            return value;
          }
        },
        { 
          title: 'Loại', 
          field: 'TypeName', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: function(cell) {
            const value = cell.getValue();
            if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
              return '';
            }
            return value;
          }
        },
      ],
    });
    this.teamTabulator.on("rowSelectionChanged", (data: any) => {
      const teamId = data[0].ID;
      let departmentId = 0;
      if(data[0].ParentID === 0) {
        departmentId = data[0].DepartmentID;
      }
      this.loadUserTeam(teamId,departmentId);
    });
  }

  private initializeEmployeeTable(): void {
    this.employeeTabulator = new Tabulator('#employee-table', {
      data: this.employeeList,
      layout: 'fitColumns',
      selectableRows: true,
      responsiveLayout: true,
      dataTree: true,
      rowHeader:{formatter:"rowSelection", titleFormatter:"rowSelection", headerSort:false, width:70, frozen:true, headerHozAlign:"center", hozAlign:"center"},
      dataTreeStartExpanded: true,
      dataTreeChildField: "children",
      height: '75vh',
      columns: [
        { 
          title: 'Mã nhân viên', 
          field: 'Code', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: function(cell) {
            const data = cell.getRow().getData();
            // If it's a team row, show team name with tree formatter
            if (data['children'] && data['children'].length > 0) {
              return `<span class="tabulator-tree-control"></span>${data['Team']}`;
            }
            // If it's an employee row, show employee code
            return data['Code'];
          }
        },
        { 
          title: 'Tên nhân viên', 
          field: 'FullName', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
        }
      ],
    });
  }

  private initializeEmployeeTeamTable(): void {
    this.employeeTeamTabulator = new Tabulator('#employee-team-table', {
      data: this.employeeTeamList,
      layout: 'fitColumns',
      selectableRows: true,
      rowHeader:{formatter:"rowSelection", titleFormatter:"rowSelection", headerSort:false, width:70, frozen:true, headerHozAlign:"center", hozAlign:"center"},
      responsiveLayout: true,
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeChildField: "children",
      height: '75vh',
      columns: [
        { 
          title: 'Mã nhân viên', 
          field: 'Code', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
          formatter: function(cell) {
            const data = cell.getRow().getData();
            // If it's a team row, show department name with tree formatter
            if (data['children'] && data['children'].length > 0) {
              return `<span class="tabulator-tree-control text-left"></span>${data['DepartmentName']}`;
            }
            // If it's an employee row, show employee code
            return data['Code'];
          }
        },
        { 
          title: 'Tên nhân viên', 
          field: 'FullName', 
          hozAlign: 'center', 
          headerHozAlign: 'center',
        }
      ],
    });

    // Hàm bắt sự kiện chọn tất cả nhân viên khi chọn phòng ban
    this.employeeTeamTabulator.on("rowSelectionChanged", (data, rows) => {
      if (rows.length > 0) {
        const row = rows[0];
        const rowData = row.getData();
        
        // If this is a parent row (has children)
        if (rowData['children'] && rowData['children'].length > 0) {
          const isSelected = row.isSelected();
          
          // Get all child rows
          const childRows = row.getTreeChildren();
          
          // Select/deselect all children
          childRows.forEach(childRow => {
            if (isSelected) {
              childRow.select();
            } else {
              childRow.deselect();
            }
            
          });
        }
      }
    });
  }

  

  resetDepartment() {
    this.department = null;
    this.loadTeams();
    this.employeeList = [];
    this.employeeTabulator.setData([]);
  }

  resetDepartmentEmployee() {
    this.departmentEmployee = null;
    this.loadEmployeeTeam(0,0);
    this.employeeTeamList = [];
    this.employeeTeamTabulator.setData([]);
  }

  openAddModal() {
    const selectedRows = this.teamTabulator.getSelectedRows();
    console.log(selectedRows);

    if(selectedRows.length === 0) {
      this.team = {
        ID: 0,
        DepartmentID: 0,
        ParentID: 0,
        Code: '',
        Name: '',
        Leader: '',
        TypeName: '',
        LeaderID: 0,
        ProjectTypeID: 0,
      }
    }
    this.isEditMode = false;
    this.selectedTeam = selectedRows[0].getData();
    
    this.team = {
      ID: 0,
      DepartmentID: this.selectedTeam.DepartmentID,
      ParentID: this.selectedTeam.ID,
      Code: '',
      Name: '',
      Leader: '',
      TypeName: '',
      LeaderID: 0,
      ProjectTypeID: 0,
    }

    const modal = new (window as any).bootstrap.Modal(document.getElementById('addTeamModal'));
    modal.show();
  }

  openEditModal() {
    const selectedRows = this.teamTabulator.getSelectedRows();
    this.selectedTeam = selectedRows[0].getData();
    console.log(this.selectedTeam);
    this.isEditMode = true;

    this.team = {
      ID: this.selectedTeam.ID,
      DepartmentID: this.selectedTeam.DepartmentID,
      ParentID: this.selectedTeam.ParentID,
      Code: this.selectedTeam.Code,
      Name: this.selectedTeam.Name,
      Leader: this.selectedTeam.Leader,
      TypeName: this.selectedTeam.TypeName,
      LeaderID: this.selectedTeam.LeaderID,
      ProjectTypeID: this.selectedTeam.ProjectTypeID,
    }

    const modal = new (window as any).bootstrap.Modal(document.getElementById('addTeamModal'));
    modal.show();
  }

  // Add new method to flatten team tree
  private flattenTeamTree(items: any[], level: number = 0, parent: any = null): any[] {
    let result: any[] = [];
    items.forEach(item => {
      const flatItem = {
        ...item,
        level: level,
        parent: parent ? parent.Name : null,
        expanded: false
      };
      result.push(flatItem);
      if (item.children && item.children.length > 0) {
        result = result.concat(this.flattenTeamTree(item.children, level + 1, item));
      }
    });
    return result;
  }

  onSubmit(form: any) {
    if(form.valid) {
      if(this.isEditMode) {
        this.teamService.saveTeam(this.team).subscribe({
          next: (response) => {
            this.closeModal();
            this.loadTeams();
            this.initializeTeamTable();
            Swal.fire({
              title: 'Thành công',
              text: 'Cập nhật thông tin nhóm thành công',
              icon: 'success'
            });
        },
        error: (error) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Cập nhật thông tin nhóm thất bại',
            icon: 'error'
          });
        }
      });
    } else {
      this.teamService.saveTeam(this.team).subscribe({
        next: (response) => {
          this.closeModal();
          this.loadTeams();
          this.initializeTeamTable();
          Swal.fire({
            title: 'Thành công',
            text: 'Thêm nhóm thành công',
            icon: 'success'
          });
        },
        error: (error) => {
          Swal.fire({
            title: 'Thất bại',
            text: 'Thêm nhóm thất bại',
            icon: 'error'
          });
        }
      });
    }
    }
  }

  closeModal() {
    const modal = document.getElementById('addTeamModal');
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal).hide();
    }
  }

  openDeleteModal() {
    const selectedRows = this.teamTabulator.getSelectedRows();
    if(selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn nhóm cần xóa',
        icon: 'warning'
      });
      return;
    }
    this.selectedTeamId = selectedRows[0].getData()['ID'];
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa nhóm này không?',
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if(result.isConfirmed) {
        this.deleteTeam();
      }
    });
  }

  deleteTeam() {
    this.teamService.deleteTeam(this.selectedTeamId).subscribe({
      next: (response) => {
        this.loadTeams();
        this.initializeTeamTable();
        Swal.fire({
          title: 'Thành công',
          text: 'Xóa nhóm thành công',
          icon: 'success'
        });
      },
      error: (error) => {
        Swal.fire({
          title: 'Thất bại',
          text: 'Xóa nhóm thất bại',
          icon: 'error'
        });
      }
    });
  }

  openAddEmployeeModal() {
    const selectedRows = this.teamTabulator.getSelectedRows();
  
    if(selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn team cần thêm nhân viên',
        icon: 'warning'
      });
      return;
    }

    this.selectedTeam = selectedRows[0].getData();
    console.log(this.selectedTeam.ID);
    if(this.selectedTeam.ParentID === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Không thể thêm nhân viên vào team cha',
        icon: 'warning'
      });
      return;
    }
    this.loadEmployeeTeam(0, this.selectedTeam.ID);

    const modal = new (window as any).bootstrap.Modal(document.getElementById('addEmployeeModal'));
    modal.show();
  }

  addEmployeesToTeam() {
    const selectedRows = this.employeeTeamTabulator.getSelectedRows();
    if(selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn nhân viên cần thêm',
        icon: 'warning'
      });
      return;
    }

    const employeeIds = selectedRows.map(row => row.getData()['ID']);
    console.log(employeeIds);
    console.log(this.selectedTeam['ID']);
    const request = {
      TeamID: this.selectedTeam['ID'],
      ListEmployeeID: employeeIds
    };

    this.teamService.addEmployeesToTeam(request).subscribe({
      next: (response: any) => {
        this.closeEmployeeModal();
        this.loadUserTeam(this.selectedTeam['ID'], 0);
        Swal.fire({
          title: 'Thành công',
          text: 'Thêm nhân viên vào team thành công',
          icon: 'success'
        });
      },
      error: (error: any) => {
        Swal.fire({
          title: 'Thất bại',
          text: 'Thêm nhân viên vào team thất bại',
          icon: 'error'
        });
      }
    });
  }

  closeEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal).hide();
    }
  }

  removeEmployeeFromTeam() {
    const selectedTeamRows = this.teamTabulator.getSelectedRows();
    console.log(selectedTeamRows[0].getData());
    const selectedRows = this.employeeTabulator.getSelectedRows();
    if(selectedRows.length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng chọn nhân viên cần xóa',
        icon: 'warning'
      });
      return;
    }
    const employeeIds = selectedRows.map(row => row.getData()['ID']);
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa nhân viên khỏi team này không?',
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if(result.isConfirmed) {
        employeeIds.forEach(id => {
          this.teamService.removeEmployeeFromTeam(id).subscribe({
            next: (response: any) => {
              this.loadUserTeam(selectedTeamRows[0].getData()['ID'], 0);
              Swal.fire({
                title: 'Thành công',
                text: 'Xóa nhân viên khỏi team thành công',
                icon: 'success'
              });
            },
            error: (error: any) => {
              Swal.fire({
                title: 'Thất bại',
                text: 'Xóa nhân viên khỏi team thất bại',
                icon: 'error'
              });
            }
          });
        });
      }
    });
    
  }
}

