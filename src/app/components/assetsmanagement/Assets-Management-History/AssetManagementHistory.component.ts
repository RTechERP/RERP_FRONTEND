import { Component, OnInit } from '@angular/core';
import { AssetManagementServiceService } from './AssetManagementHistoryService/AssetManagementService.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';


@Component({
  selector: 'app-AssetManagementHistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './AssetManagementHistory.component.html',
  styleUrls: ['./AssetManagementHistory.component.css']
})
export class AssetManagementHistoryComponent implements OnInit {
  assetallocationn: any[] = [];
  table: Tabulator | null = null;
  constructor(private assetallocation: AssetManagementServiceService) { }

  ngOnInit() {
    this.getAll();
  }
  getAll() {
    this.assetallocation.getAssetAllocation()
      .subscribe((response: any) => {
        console.log(response);            // 1. In toàn bộ object về để xem các property
        this.assetallocationn = response.data;    // 2. Hoặc nếu API trả về hàm: response.getData()
        console.log('Data:', this.assetallocationn);
        this.drawtable();

      });
  }
  public drawtable(): void {
    if (this.table) {
      this.table.setData(this.assetallocationn);
    }
    else {
      this.table = new Tabulator('#datatableallocation', {
        data: this.assetallocationn,
        layout: "fitDataFill",
        pagination: true,
        selectableRows: 1,
        height: 500,
        movableColumns: true,
        paginationSize: 15,
        paginationSizeSelector: [5, 10, 20, 50, 100],
        reactiveData: true,
        placeholder: 'Không có dữ liệu',
        dataTree: true,
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,
        columns: [
          { title: 'ID', field: 'ID' },
          { title: 'Code', field: 'Code' },
          { title: 'Tạo bởi', field: 'CreatedBy' },
          { title: 'Ngày Cấp', field: 'DateAllocation' },
          { title: 'Mã nhân viên', field: 'EmployeeID' },
          { title: 'Ghi chú', field: 'Note' },
          {title:'Kế toán duyệt', field:'IsApproveAccountant'},
          { title: 'Trạng thái', field: 'Status' },
          { title: 'Cập nhật bởi', field: 'UpdatedBy' },
          { title: 'Ngày cập nhật', field: 'UpdatedDate' },

        ],
      });
    }
  }
}
