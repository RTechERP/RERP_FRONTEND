import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  TabulatorFull as Tabulator,
  ColumnDefinition,
  CellComponent,
} from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css';
import { FormsModule } from '@angular/forms';
import { ProjectPartlistPriceRequestService } from '../project-partlist-price-request-service/project-partlist-price-request.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import moment from 'moment';
declare var bootstrap: any;

@Component({
  standalone: true,
  imports: [FormsModule, NgSelectModule, ReactiveFormsModule],
  selector: 'app-project-partlist-price-request-form',
  templateUrl: './project-partlist-price-request-form.component.html',
  styleUrls: ['./project-partlist-price-request-form.component.css'],
})
export class ProjectPartlistPriceRequestFormComponent
  implements OnInit, AfterViewInit, OnChanges
{
  // lấy service
  private priceRequestService = inject(ProjectPartlistPriceRequestService);
  @Input() dataInput: any; // Nhận dữ liệu từ component cha
  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmitted = new EventEmitter<void>();

  close() {
    this.modalInstance.hide();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataInput'] && this.modalElementRef) {
      // Delay để chắc chắn phần tử modal đã render

      setTimeout(() => {
        if (!this.modalInstance) {
          this.modalInstance = new bootstrap.Modal(
            this.modalElementRef.nativeElement
          );
        }
        this.modalInstance.show();
      }, 0);
    }
  }
  @ViewChild('detailModal', { static: false }) modalElementRef!: ElementRef;
  modalInstance: any;
  // form model
  requester: Number = 0;
  requestDate: string = '';

  users = [];
  dtProductSale: any[] = [];
  lstSave: any[] = [];
  // Tabulator
  @ViewChild('table', { static: false }) tableDiv!: ElementRef;
  table!: Tabulator;
  tableData: any[] = []; // ban đầu rỗng

  constructor() {}
  public openModal() {
    const modalElement = this.modalElementRef.nativeElement;
    this.modalInstance = bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }
  ngOnInit(): void {
    this.lstSave = [];
    this.getAllUser();  
    this.getProductSale();
              console.log('datainput',this.dataInput);
    this.requester = Number(this.dataInput[0]['EmployeeID']);
    console.log('abd',this.requester)
    this.requestDate = moment(this.dataInput[0]['DateRequest']).format(
      'YYYY-MM-DD'
    );
    this.tableData = this.dataInput;
    this.priceRequestService.getProductSale().subscribe({
      next: (response) => {
        const prd = response.data;
        this.table = new Tabulator(this.tableDiv.nativeElement, {
          data: this.tableData,
          layout: 'fitDataStretch',
          columns: [
            {
              title: '',
              headerSort: false,
              formatter: () =>
                `<i class="fa-solid fa-xmark" style="cursor:pointer;color:red;"></i>`,
              width: 50,
              hozAlign: 'center',
              headerHozAlign: 'center',
              cellClick: (_e, cell) => {
                const row = cell.getRow();
                const rowData = row.getData();

                if (rowData['ID']) {
                  const deletedRow = { ...rowData, IsDeleted: true };
                  this.lstSave.push(deletedRow);
                }

                row.delete();
              },
            },
            {
              title: 'ID',
              field: 'ID',
              visible: false,
            },
            {
              title: 'STT',
              headerSort: false,
              formatter: 'rownum',
              width: 50,
              hozAlign: 'center',
              headerHozAlign: 'center',
            },
            {
              title: 'Mã nội bộ',
              headerSort: false,
              field: 'ProductNewCode',
              hozAlign: 'center',
              editor: 'list',
              formatter: (cell: any) => {
                const value = cell.getValue();
                const match = this.dtProductSale.find((c) => c.ID === value);
                return match ? match.ProductCode : '';
              },
              editorParams: {
                values: this.dtProductSale.map((s) => ({
                  value: s.ID,
                  label: s.ProductCode,
                })),

                autocomplete: true,
              },
              cellEdited: (cell) => {
                const selectedId = cell.getValue(); // Lấy ID từ giá trị đã chọn
                const product = prd.find(
                  (p: { ID: any }) => p.ID === selectedId
                ); // Tìm sản phẩm theo ID

                if (product) {
                  cell.getRow().update({
                    ProductCode: product.ProductCode,
                    ProductName: product.ProductName,
                    Unit: product.Unit,
                    Maker: product.Maker,
                    StatusRequest: product.StatusRequest,
                  });
                }
              },
            },

            {
              title: 'Mã sản phẩm',
              headerSort: false,
              field: 'ProductCode',
              editor: 'input',
              headerHozAlign: 'center',
              validator: ['required'],
            },
            {
              title: 'Tên sản phẩm',
              headerSort: false,
              field: 'ProductName',
              editor: 'input',
              headerHozAlign: 'center',
              validator: ['required'],
            },
            {
              title: 'Hãng',
              headerSort: false,
              field: 'Maker',
              editor: 'input',
              headerHozAlign: 'center',
            },
            {
              title: 'Deadline',
              headerSort: false,
              field: 'Deadline',
              editor: 'date',
              formatter: function (cell: any) {
                const value = cell.getValue();
                return value ? moment(value).format('DD/MM/YYYY') : '';
              },
              headerHozAlign: 'center',
              validator: ['required'],
            },
            {
              title: 'SL yêu cầu',
              headerSort: false,
              field: 'Quantity',
              editor: 'input',
              headerHozAlign: 'center',
              validator: ['required'],
            },
            {
              title: 'ĐVT',
              headerSort: false,
              field: 'Unit',
              editor: 'input',
              headerHozAlign: 'center',
              validator: ['required'],
            },
            {
              title: 'Trạng thái',
              headerSort: false,
              field: 'StatusRequest',
              editor: 'input',
              headerHozAlign: 'center',
            },
            {
              title: 'Ghi chú',
              headerSort: false,
              field: 'Note',
              editor: 'input',
              headerHozAlign: 'center',
            },
          ],
          height: '30vh',
          headerSort: false,
          reactiveData: true,
          rowHeader: {
            headerSort: false,
            resizable: false,
            frozen: true,
          },
        });
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách product sale:', err);
      },
    });
    // this.drawTable();
  }
  getAllUser() {
    this.priceRequestService.getUser().subscribe({
      next: (response) => {
        this.users = response.data.dtEmployee;

        console.log(this.users);
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
      },
    });
  }
  getProductSale() {
    this.priceRequestService.getProductSale().subscribe({
      next: (response) => {
        this.dtProductSale = response.data;
        console.log('dtproductsale: ', this.dtProductSale);
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách product sale:', err);
      },
    });
  }
  ngAfterViewInit(): void {
    // Khởi tạo và hiển thị modal
    this.modalInstance = new bootstrap.Modal(
      this.modalElementRef.nativeElement
    );
    this.modalInstance.show();

    // Xử lý sự kiện khi modal đóng
    this.modalElementRef.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {
        this.closeModal.emit();
      }
    );

  }

  addRow() {
    this.table.addRow({});
  }
  checkDeadline(deadline: Date): boolean {
    const now = new Date();
    const fifteenPM = new Date(now);
    fifteenPM.setHours(15, 0, 0, 0);

    let dateRequest = new Date(now);

    // Nếu sau 15h thì tính từ ngày hôm sau
    if (now >= fifteenPM) {
      dateRequest.setDate(dateRequest.getDate() + 1);
    }

    // Nếu là T7 hoặc CN thì đẩy sang thứ 2
    if (dateRequest.getDay() === 6) {
      // Saturday
      dateRequest.setDate(dateRequest.getDate() + 2);
    } else if (dateRequest.getDay() === 0) {
      // Sunday
      dateRequest.setDate(dateRequest.getDate() + 1);
    }

    // Tính số ngày làm việc giữa dateRequest và deadline (không tính T7, CN)
    let workDays: Date[] = [];
    const dateReq = new Date(dateRequest.toDateString());
    const dateDL = new Date(deadline.toDateString());
    const totalDays = Math.floor(
      (dateDL.getTime() - dateReq.getTime()) / (1000 * 3600 * 24)
    );

    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(dateReq);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        workDays.push(d);
      }
    }

    if (workDays.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Thông báo',
        text: `Deadline phải ít nhất là 2 ngày làm việc tính từ [${dateRequest.toLocaleDateString(
          'vi-VN'
        )}] (không tính Thứ 7 & Chủ nhật).`,
      });
      return false;
    }

    return true;
  }
  validate(): boolean {
    const employeeID = Number(this.requester);
    if (employeeID <= 0) {
      Swal.fire('Thông báo', 'Vui lòng chọn Người yêu cầu!', 'warning');
      return false;
    }

    const rows = this.table.getRows();
    if (rows.length <= 0) {
      Swal.fire('Thông báo', 'Vui lòng tạo ít nhất một yêu cầu!', 'warning');
      return false;
    }
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const data = row.getData();
      const stt = i + 1;
      const code = (data['ProductCode'] || '').trim();
      const name = (data['ProductName'] || '').trim();
      const maker = (data['Maker'] || '').trim();
      const unit = (data['Unit'] || '').trim();
      const quantity = Number(data['Quantity']);
      const deadline = data['Deadline'] ? new Date(data['Deadline']) : null;

      if (!code) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập Mã sản phẩm tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      }

      if (!name) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập Tên sản phẩm tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      }

      if (!deadline || isNaN(deadline.getTime())) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập Deadline sản phẩm tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      } else if (!this.checkDeadline(deadline)) {
        return false;
      }

      if (isNaN(quantity) || quantity <= 0) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập SL yêu cầu tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      }

      if (!maker) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập Hãng tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      }

      if (!unit) {
        Swal.fire(
          'Thông báo',
          `Vui lòng nhập ĐVT tại dòng [${stt}]!`,
          'warning'
        );
        return false;
      }
    }

    return true;
  }
  saveAndClose() {
    if (!this.validate()) return;

    // Lấy dữ liệu bảng, loại bỏ trường ProductNewCode nếu backend không cần
    const updatedData = this.table.getRows().map((row) => {
      const data = row.getData(); // lấy toàn bộ data, kể cả cột ẩn
      const { ProductNewCode, ...rest } = data;

      return {
        ...rest,
        ID: data['ID'] ?? 0, // nếu undefined/null => gán 0
        Quantity: Number(data['Quantity']),
        StatusRequest: data['StatusRequest'] ?? '', // nếu không có => mặc định 1
        Maker: data['Maker'] ?? '',
        DateRequest: this.requestDate,
        EmployeeID: this.requester,
      };
    });
    this.lstSave.push(...updatedData);
    this.priceRequestService.saveData(this.lstSave).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Thông báo',
          text: `Lưu dữ liệu thành công!`,
        });
        this.formSubmitted.emit();
        this.modalInstance.hide();
      },
      error: (e) => {
        console.error(e);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Lưu dữ liệu thất bại!',
        });
      },
    });
  }
}
