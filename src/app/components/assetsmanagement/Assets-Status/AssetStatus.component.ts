import { Component, OnInit } from '@angular/core';
import { AssetStatusService } from './AssetStatusService/AssetStatus.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

@Component({
  selector: 'app-AssetStatus',
  standalone:true,
  imports:[CommonModule,FormsModule],
  templateUrl: './AssetStatus.component.html',
  styleUrls: ['./AssetStatus.component.css']
})
export class AssetStatusComponent implements OnInit {
status:any[]=[];
table:Tabulator|null=null;
  constructor(private statusservice:AssetStatusService) { }

  ngOnInit() {
    this.getAll();
  }
getAll(){
  this.statusservice.getStatus().subscribe((response:any)=>
  {
    this.status=response.data;
    console.log(this.status);
    this.drawtable();

  })
}
private drawtable():void{
  if(this.table)
  {
    this.table.setData(this.status);
  }
  else
  {
    this.table= new Tabulator('#datatablestatus',{
      data:this.status,
       layout: 'fitColumns',
        reactiveData: true,
          columns: [
          { title: 'ID', field: 'ID' },
          { title: 'Trạng thái', field: 'Status' },
        
        ],
    });
  }
}
}
