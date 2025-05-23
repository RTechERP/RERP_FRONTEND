import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TypeAssetsService } from './TypeAssets.service';
declare var bootstrap: any;
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-TypeAssets',
  templateUrl: './TypeAssets.component.html',
  styleUrls: ['./TypeAssets.component.css']
})
export class TypeAssetsComponent implements OnInit {

  constructor(private typeassetsservice: TypeAssetsService) { }

  ngOnInit(): void {
    this.getAll();// Call the getAll method to fetch assets when the component initializes
  }
  typeassets: any[] = [];
  table: Tabulator | null = null; // Declare assets as an array of any type
  getAll() {
    this.typeassetsservice.getTypeAssets().subscribe((data: any) => {
      this.typeassets = data.data; // Assign the response data to the assets property
      console.log(this.typeassets);
      this.drawTable(); // Log the assets to the console
    });
  }
  private drawTable(): void {
    if (this.table) {
      this.table.setData(this.typeassets);
    } else {
      this.table = new Tabulator('#datatables', {
        data: this.typeassets,
        layout: 'fitColumns',

      
        columns: [
          { title: 'Mã loại tài sản', field: 'AssetCode' },
          { title: 'Tên loại tài sản', field: 'AssetType' },

        ],
      });
    }
  }
  // Các biến để binding input
}
