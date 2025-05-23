import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TSReportBrokenAssetService } from './TSReportBrokenAssetService/TSReportBrokenAsset.service';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

@Component({
  selector: 'app-TSReportBrokenAsset',
  templateUrl: './TSReportBrokenAsset.component.html',
  styleUrls: ['./TSReportBrokenAsset.component.css']
})
export class TSReportBrokenAssetComponent implements OnInit {
reportbroken:any[]=[];
tablereport:Tabulator|null=null;

  constructor(private reportservice:TSReportBrokenAssetService) { }

  ngOnInit() :void{
    this.getAll();
  }
getAll()
{
this.reportservice.getReportBroken().subscribe((response:any)=>{
  this.reportbroken=response.data;
  console.log(this.reportbroken);
  this.drawTable();
})
}
private drawTable(): void {
    if (this.tablereport) {
      this.tablereport.setData(this.tablereport); 
    } else {
      this.tablereport = new Tabulator('#datatable', {
        data: this.reportbroken,
      
       
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
         columns :[
  { title: "ID", field: "ID", width: 80 },
  { title: "Mã tài sản", field: "AssetManagementID" },
  { title: "Ngày báo hỏng", field: "DateReportBroken" },
  { title: "Lý do hỏng", field: "Reason" },
  { title: "Ngày tạo", field: "CreatedDate" },
  { title: "Người tạo", field: "CreatedBy" },
  { title: "Ngày cập nhật", field: "UpdatedDate" },
  { title: "Người cập nhật", field: "UpdatedBy" }
]
      });
    }
  }
}
