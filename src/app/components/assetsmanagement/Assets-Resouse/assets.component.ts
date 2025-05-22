import { Component, OnInit } from '@angular/core';
import { AssetsService } from './assets.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  assets: any[] = [];
  table: Tabulator | null = null;

  constructor(private assetsService: AssetsService) {}

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.assetsService.getAssets().subscribe((response: any) => {
      this.assets = response.data;
      console.log(this.assets);
      this.drawTable(); // Gọi sau khi lấy dữ liệu thành công
    });
  }

  private drawTable(): void {
    if (this.table) {
      this.table.setData(this.assets); 
    } else {
      this.table = new Tabulator('#datatable', {
        data: this.assets,
        layout: 'fitColumns',
       
        reactiveData: true,
        columns: [
          { title: 'Mã nguồn gốc', field: 'SourceCode' },
          { title: 'Tên nguồn gốc', field: 'SourceName' },
        
        ],
      });
    }
  }
}
