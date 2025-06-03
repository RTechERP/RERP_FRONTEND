import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, viewChild, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerPartService } from '../customer-part/customer-part/customer-part.service';

@Component({
  selector: 'app-customer-part',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './customer-part.component.html',
  styleUrl: './customer-part.component.css'
})
export class CustomerPartComponent implements OnInit, AfterViewInit {
  @Input() customerId: number = 0;
  @ViewChild('CustomerPartTable', { static: false }) CustomerPartTableElement!: ElementRef;

  private customerPartTable!: Tabulator;

  customers: any[] = [];
  customerParts: any[] = [];
  originalCustomerParts: any[] = [];
  selectedCustomer: any = null;

  constructor(public activeModal: NgbActiveModal, private customePartService: CustomerPartService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit(): void {

  }

  loadCustomers(): void {
    this.customePartService.getCustomer().subscribe(
      response => {
        if (response.status === 1) {
          this.customers = response.data;
          if (this.customerId > 0) {
            this.selectedCustomer = this.customers.find(c => c.ID === this.customerId);
            if (this.selectedCustomer) {
              this.loadCustomerParts(this.customerId);
            }
          }
        } else {
          console.error('Lỗi khi tải khách hàng:', response.message);
        }
      },
      error => {
        console.error('Lỗi kết nối khi tải khách hàng:', error);
      }
    );
  }

  loadCustomerParts(customerId: number): void {
    this.customePartService.getPart(customerId).subscribe(
      response => {
        if (response.status === 1) {
          this.customerParts = response.data[0];
          this.originalCustomerParts = JSON.parse(JSON.stringify(this.customerParts));
          this.initCustomerPartsTable();
        } else {
          console.error("Lỗi khi lấy CustomerPart", response.message);
        }
      },
      error => {
        console.error("Lỗi kết nối khi tải CustomerPart", error);
      }
    );
  }

  onCustomerChange(event: any): void {
    if (event) {
      this.loadCustomerParts(event.ID);
    }
  }

  initCustomerPartsTable(): void {
    if (!this.CustomerPartTableElement || !this.CustomerPartTableElement.nativeElement) return;

    if (this.customerPartTable) {
      this.customerPartTable.destroy();
    }

    this.customerPartTable = new Tabulator(this.CustomerPartTableElement.nativeElement, {
      data: this.customerParts,
      layout: 'fitDataFill',
      pagination: true,
      paginationSize: 20,
      height: '35vh',
      movableColumns: true,
      resizableRows: true,
      reactiveData: true,
      columns: [
        {
          title: '', field: 'actions', formatter: (cell, formatterParams) => {
            return `<i class="bi bi-trash3 text-danger" style="font-size:15px; cursor:pointer"></i>`;
          },
          width: '10%',
          cellClick: (e, cell) => {
            cell.getRow().delete();
          }
        },
        { title: 'Mã bộ phận', field: 'PartCode', sorter: 'string', width: "45%", editor: "input" },
        { title: 'Tên bộ phận', field: 'PartName', sorter: 'string', width: "45%", editor: "input" },
      ]
    });
  }

  addNewRow(): void {
    if (!this.selectedCustomer) {
      alert('Vui lòng chọn khách hàng trước!');
      return;
    }

    const newRow = {
      PartCode: '',
      PartName: '',
      CustomerID: this.selectedCustomer.ID
    };

    this.customerPartTable.addRow(newRow, true);
  }
  saveCustomerParts() {
    if (!this.selectedCustomer) {
      alert('Vui lòng chọn khách hàng trước!');
      return;
    }
    //Lấy dữ liệu ban đầu
    const originalData = this.originalCustomerParts;

    //Lấy dữ liệu hiện tại của bảng
    const currentData = this.customerPartTable.getData();

    //Phân loại dữ liệu
    const addedParts = currentData.filter(row => !row.ID).map(row => ({
      PartCode: row.PartCode || '',
      PartName: row.PartName || '',
      CustomerID: this.selectedCustomer.ID,
    }));

    const updatedParts = currentData.filter(row => {
      if (!row.ID) return false;
      const originalRow = originalData.find(o => o.ID === row.ID);
      if (!originalRow) return false;
  
      return originalRow.PartCode !== row.PartCode ||
             originalRow.PartName !== row.PartName;
    }).map(row => {
      // Chỉ gửi các field cần thiết để tránh lỗi validation
      const cleanedRow: any = {
        ID: row.ID,
        PartCode: row.PartCode || '',
        PartName: row.PartName || '',
        CustomerID: this.selectedCustomer.ID
      };

      // Chỉ thêm STT nếu có giá trị hợp lệ
      if (row.STT !== null && row.STT !== undefined && !isNaN(row.STT)) {
        cleanedRow.STT = parseInt(row.STT.toString());
      }
      
      return cleanedRow;
    });
  

    const deletedPartIds = originalData
      .filter(original => !currentData.some(current => current.ID === original.ID))
      .map(part => part.ID);

    //Gộp
    const saveData = {
      model: 'CustomerPart',
      customerId: this.selectedCustomer.ID,
      addedParts,
      updatedParts,
      deletedPartIds
    }

    // Debug logs
    console.log('Original Data:', originalData);
    console.log('Current Data:', currentData);
    console.log('Updated Parts:', updatedParts);
    console.log('Save Data:', saveData);

    this.customePartService.saveCustomerPart(saveData).subscribe(response => {
      if (response.status === 1) {
        alert('Lưu thành công');
        this.activeModal.close(true);
      } else {
        alert('Lỗi khi lưu' + response.message);
      }
    }, error => {
      console.error("Lỗi khi lưu:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu");
    });

  }
  closeModal() {
    this.activeModal.close();
  }
}
