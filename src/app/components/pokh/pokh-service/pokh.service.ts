import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokhServiceService {
  private _url = 'https://localhost:7187/api/POKH/';
  constructor(private http: HttpClient) { }
  getPokhById(id: number): Observable<any> {
    return this.http.get<any>(this._url + 'GetPOKHByID' + id);
  }
  getPOKH(filterText: string, pageNumber: number, pageSize: number, customerId: number, userId: number, POType: number, status: number, group: number, startDate: Date, endDate: Date, warehouseId: number, employeeTeamSaleId: number): Observable<any> {
    return this.http.get<any>((this._url + 'GetPOKH'), {
      params: {
        filterText,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        customerId: customerId.toString(),
        userId: userId.toString(),
        POType: POType.toString(),
        status: status.toString(),
        group: group.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        warehouseId: warehouseId.toString(),
        employeeTeamSaleId: employeeTeamSaleId.toString()
      }
    });
  }
  handlePOKH(pokh: any): Observable<any> {
    return this.http.post<any>(this._url + 'Handle', pokh);
  }
  deletePOKH(id: number): Observable<any> {
    return this.http.delete<any>(this._url + 'DeletePOKH' + id);
  }
  deleteRangePOKH(ids: number[]): Observable<any> {
    return this.http.post<any>(this._url + 'DeleteRangePOKH', ids);
  }
  loadEmployeeManagers(group: number = 0, userId: number = 0, teamId: number = 0): Observable<any> {
    return this.http.get<any>(this._url + 'GetEmployeeManager', {
      params: {
        group: group.toString(),
        userId: userId.toString(),
        teamId: teamId.toString()
      }
    });
  }
  loadProject(): Observable<any> {
    return this.http.get<any>(this._url + 'LoadProject');
  }

  getTypePO(): Observable<any> {
    return this.http.get<any>(this._url + 'GetTypePO');
  }

  getPart(id: number): Observable<any> {
    return this.http.get<any>(this._url + 'GetPart', {
      params: {
        id: id.toString()
      }
    });
  }

  getCurrency(): Observable<any> {
    return this.http.get<any>(this._url + 'GetCurrency');
  }

  getCustomer(): Observable<any> {
    return this.http.get<any>(this._url + 'GetCustomer');
  }
  getPOKHProduct(id: number = 0, idDetail: number = 0): Observable<any> {
    return this.http.get<any>(this._url + 'LoadPOKHProduct', {
      params: {
        id: id.toString(),
        idDetail: idDetail.toString()
      }
    });
  }
  getPOKHFile(id: number = 0): Observable<any> {
    return this.http.get<any>(this._url + 'LoadPOKHFiles', {
      params: {
        id: id.toString()
      }
    });
  }
  generatePOCode(customer: string, isCopy: boolean, warehouseID: number, pokhID: number): Observable<any> {
    return this.http.get<any>(this._url + 'GeneratePOCode',
      {
        params: {
          customer: customer,
          isCopy: isCopy.toString(),
          warehouseID: warehouseID.toString(),
          pokhID: pokhID.toString()
        }
      }
    );
  }
  loadProducts(): Observable<any> {
    return this.http.get<any>(this._url + 'LoadProduct');
  }
  loadUserDetail(id: number, idDetail: number): Observable<any> {
    return this.http.get<any>(this._url + 'LoadDetailUser',
      {
        params: {
          id: id,
          idDetail: idDetail
        }
      }
    )
  }
  uploadFiles(files: File[], id: number): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('poKHID', id.toString());

    return this.http.post<any>(this._url + 'Upload', formData);
  }
  
}
