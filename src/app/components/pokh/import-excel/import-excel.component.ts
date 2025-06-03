import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styleUrl: './import-excel.component.css',
  imports: [CommonModule]
})
export class ImportExcelComponent implements OnInit {
  @ViewChild('tableContainer', { static: true }) tableElement!: ElementRef;
  private table!: Tabulator;

  constructor() {}

  ngOnInit(): void {
    this.initializeTable();
  }

  initializeTable(): void {
    this.table = new Tabulator(this.tableElement.nativeElement, {
      height: 311,
      layout: "fitColumns",
      autoColumns: true,
      placeholder: "Awaiting Data, Please Load File",
    });
  }

  // openFileExplorer() {
  //   const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
  //   if (fileInput) {
  //     fileInput.click();
  //   }
  // }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (e.target?.result) {
          this.table.import(fileExtension as any, e.target.result as string);
        }
      };

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  }

  
}
