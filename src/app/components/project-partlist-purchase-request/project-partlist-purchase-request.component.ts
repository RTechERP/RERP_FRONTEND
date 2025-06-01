import { Component, OnInit } from '@angular/core';
import {
  TabulatorFull as Tabulator,
  ColumnComponent,
  MenuObject,
  RowComponent,
} from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_simple.min.css'; // Import Tabulator stylesheet
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { USER_NAME } from '../../shared/global';
import { EMPLOYEE_ID } from '../../shared/global';
import { ISADMIN } from '../../app.config';
import * as ExcelJS from 'exceljs';
import moment from 'moment';




@Component({
  selector: 'app-project-partlist-purchase-request',
  templateUrl: './project-partlist-purchase-request.component.html',
  styleUrls: ['./project-partlist-purchase-request.component.css']
})
export class ProjectPartlistPurchaseRequestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  private GetTableConfig(): any {
    return {
      // data: this.dtprojectPartlistPriceRequest,
      layout: 'fitDataFill',
      height: '68vh',
      virtualDom: true,
      rowHeader: {
        headerSort: false,
        resizable: false,
        frozen: true,
        headerHozAlign: 'center',
        hozAlign: 'center',
        formatter: 'rowSelection',
        titleFormatter: 'rowSelection',
        cellClick: function (e: any, cell: any) {
          cell.getRow().toggleSelect();
        },
      },
      // ajaxURL: this.PriceRequetsService.getAPIPricerequest(),
      // ajaxParams: () => {
      //   // const filters = this.filters;

      //   // Sửa statusRequest = -1 nếu không muốn lọc, hoặc truyền đúng
      //   // let statusRequest = filters.statusRequest;
      //   if (statusRequest < 0) statusRequest = 0;

      //   // Xử lý projectTypeID và isCommercialProduct logic giống như ở backend
      //   let isCommercialProduct =
      //     // filters.projectTypeID === -1 ? 1 : filters.isCommercialProd;
      //   // let poKHID = filters.projectTypeID >= 0 ? 0 : filters.poKHID;

      //   return {
      //     // dateStart: moment(filters.dateStart).format('YYYY-MM-DD'),/
      //     // dateEnd: moment(filters.dateEnd).format('YYYY-MM-DD'),
      //     // statusRequest: statusRequest,
      //     projectId: filters.projectId,
      //     // keyword: filters.keyword,
      //     // isDeleted: filters.isDeleted,
      //     // projectTypeID: filters.projectTypeID,
      //     poKHID: poKHID,
      //     isCommercialProduct: isCommercialProduct,
      //     page: 1, 
      //     size: 25,
      //   };
      // },
      ajaxConfig: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },

      paginationMode: 'remote',
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      paginationInitialPage: 1,
      ajaxResponse: function (url: string, params: any, response: any) {
        // Xử lý dữ liệu trả về từ API
        return {
          data: response.data.dtData,
          last_page: response.data.totalPages,
        };
      },
      ajaxError: function (xhr: any, textStatus: any, errorThrown: any) {
        console.error('Lỗi AJAX:', textStatus, errorThrown);
        Swal.fire(
          'Lỗi',
          'Không thể tải dữ liệu từ server. Vui lòng thử lại sau.',
          'error'
        );
      },
      langs: {
        vi: {
          pagination: {
            first: '<<',
            last: '>>',
            prev: '<',
            next: '>',
            page_size: 'Số dòng:',
          },
        },
      },
      locale: 'vi',
      groupBy: 'ProjectFullName',
      groupHeader: function (value: any, count: number, data: any) {
        return `${value} <span>(${count})</span>`;
      },
      columnDefaults: {
        headerContextMenu: [
          {
            label: 'Xoá sắp xếp',
            action: (e: MouseEvent, column: ColumnComponent) => {
              column.getTable().clearSort();
            },
          },
        ] as MenuObject<ColumnComponent>[],
      },
      rowContextMenu: [
        {
          label: 'Xem chi tiết',
          action: (e: MouseEvent, row: RowComponent) => {
          
          },
        },
        { separator: true },
      ] as MenuObject<RowComponent>[],
      columns: [
        {
          title: 'ID',
          field: 'ID',
          visible: false,
          headerHozAlign: 'center',
          frozen: true,
        },
        { title: 'TT', field: 'TT', headerHozAlign: 'center', frozen: true },
        {
          title: 'Check giá',
          field: 'IsCheckPrice',
          hozAlign: 'center',
          headerSort: false,
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value === true
              ? '<i class="fa fa-check" style="color:green;"></i>'
              : '<i style="color:red;" class="fa fa-times"></i>';
          },
          frozen: true,
        },
        // {
        //   title: ' ',
        //   field: 'ProjectFullName',
        //   hozAlign: 'center',
        //   headerSort: false,
        // },
        {
          title: 'Mã dự án',
          field: 'ProjectCode',
          headerHozAlign: 'center',
          frozen: true,
        },
        {
          title: 'Mã sản phẩm',
          field: 'ProductCode',
          headerHozAlign: 'center',
          frozen: true,
          width: '15vh',
        },
        {
          title: 'Tên sản phẩm',
          field: 'ProductName',
          headerHozAlign: 'center',
          frozen: true,
          width: '20vh',
        },
        {
          title: 'Hãng',
          field: 'Manufacturer',
          headerHozAlign: 'center',
          frozen: true,
        },
        {
          title: 'Số lượng',
          field: 'Quantity',
          headerHozAlign: 'center',
        },
        {
          title: 'ĐVT',
          field: 'UnitCount',
          headerHozAlign: 'center',
        },
        {
          title: 'Trạng thái',
          field: 'StatusRequestText',
          headerHozAlign: 'center',
        },
        {
          title: 'Người yêu cầu',
          field: 'FullName',
          headerHozAlign: 'center',
        },
        {
          title: 'Sale phụ trách',
          field: 'FullNameSale',
          headerHozAlign: 'center',
        },
        {
          title: 'NV báo giá',
          field: 'QuoteEmployee',
          headerHozAlign: 'center',
        },
        {
          title: 'Ngày yêu cầu',
          field: 'DateRequest',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        {
          title: 'Deadline',
          field: 'Deadline',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        {
          title: 'Ngày báo giá',
          field: 'DatePriceQuote',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
          headerHozAlign: 'center',
        },
        {
          title: 'Loại tiền',
          field: 'CurrencyID',
          editor: 'list',

        },

        { title: 'Tỷ giá', field: 'CurrencyRate', headerHozAlign: 'center' },
        {
          title: 'Đơn giá',
          field: 'UnitPrice',
          headerHozAlign: 'center',
          editor: 'input',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
        },
        {
          title: 'Giá lịch sử',
          field: 'HistoryPrice',
          headerHozAlign: 'center',
          editor: 'input',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
        },
        {
          title: 'Thành tiền chưa VAT',
          field: 'TotalPrice',
          headerHozAlign: 'center',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
          bottomCalc: 'sum',
          bottomCalcFormatter: 'money',
          bottomCalcFormatterParams: {
            thousand: ',',
            precision: 0,
          },
        },
        {
          title: 'Thành tiền quy đổi (VNĐ)',
          field: 'TotalPriceExchange',
          headerHozAlign: 'center',
        },
        {
          title: '% VAT',
          field: 'VAT',
          headerHozAlign: 'center',
          editor: 'input',
        },
        {
          title: 'Thành tiền có VAT',
          field: 'TotaMoneyVAT',
          headerHozAlign: 'center',
          editor: 'input',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
        },
        {
          title: 'Mã NCC',
          field: 'CodeNCC',
          formatter: function (
            cell: any,
            formatterParams: any,
            onRendered: any
          ) {
            let value = cell.getValue() || '';
            return value;
          },

          headerHozAlign: 'center',
        },
        {
          title: 'Nhà cung cấp',
          field: 'SupplierSaleID',
          headerHozAlign: 'center',
          editor: 'list',


        },

        {
          title: 'Lead Time (Ngày làm việc)',
          field: 'TotalDayLeadTime',
          headerHozAlign: 'center',
          bottomCalc: 'sum',
          editor: 'input',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        {
          title: 'Ngày dự kiến hàng về',
          field: 'DateExpected',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        { title: 'Ghi chú', field: 'Note', headerHozAlign: 'center' },
        {
          title: 'Ghi chú KT',
          field: 'NotePartlist',
          width: 200,
          headerHozAlign: 'center',
        },
        {
          title: 'Thông số kỹ thuật',
          field: 'Model',
          headerHozAlign: 'center',
        },
        {
          title: 'Đơn giá xuất xưởng',
          field: 'UnitFactoryExportPrice',
          editor: 'input',
          headerHozAlign: 'center',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
        },
        {
          title: 'Đơn giá nhập khẩu',
          field: 'UnitImportPrice',
          headerHozAlign: 'center',
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
          formatter: function (
            cell: any,
            formatterParams: any,
            onRendered: any
          ) {
            let value = cell.getValue() || '';
            return value;
          }
        },
        {
          title: 'Thành tiền nhập khẩu',
          field: 'TotalImportPrice',
          headerHozAlign: 'center',
          formatter: function (
            cell: any,
            formatterParams: any,
            onRendered: any
          ) {
            let value = cell.getValue() || '';
            return value;
          },
          formatterParams: {
            thousand: ',',
            precision: 0, // không có số lẻ
          },
        },
        {
          title: 'Lead Time',
          field: 'LeadTime',
          headerHozAlign: 'center',
          formatter: function (cell: any) {
            const value = cell.getValue();
            return value ? moment(value).format('DD/MM/YYYY') : '';
          },
        },
        {
          title: 'Lý do xoá',
          field: 'ReasonDeleted',
          headerHozAlign: 'center',
        },
      ],
    };
  }
}
