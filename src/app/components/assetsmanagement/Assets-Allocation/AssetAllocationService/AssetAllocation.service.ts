import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssetAllocationService {
  private urlMaster = 'http://localhost:5207/api/Assets/getTSAssestAllocation';
  private urlDetail = 'http://localhost:5207/api/Assets/getassetsallocationdetail';
urlHrApprove='http://localhost:5207/api/Assets/HRApproved';
urlHrCancelApprove='http://localhost:5207/api/Assets/HRCancelApproved ';
urAccountantApprove='http://localhost:5207/api/Assets/AccountantApproved';
urlAccountCancelApprove='http://localhost:5207/api/Assets/AccountantCancelApproved';
urlDeleteAllocation='http://localhost:5207/api/Assets/deleteAssetAllocation';
  constructor(private http: HttpClient) {}

  getAssetsManagement(
    DateStart: string,
    DateEnd: string,
    EmployeeID: number,
    Status: number,
    FilterText: string,
    PageSize: number,
    PageNumber: number,
  ): Observable<any> {
    const params = new HttpParams()
      .set('DateStart', DateStart)
      .set('DateEnd', DateEnd)
      .set('EmployeeID', EmployeeID.toString())
      .set('Status', Status.toString())
      .set('FilterText', FilterText)
      .set('PageSize', PageSize.toString())
      .set('PageNumber', PageNumber.toString());

    return this.http.get<any>(this.urlMaster, { params });
  }

  getAssetAllocationDetail(id: number): Observable<any> {
    const url = `${this.urlDetail}?id=${id}`;
    return this.http.get<any>(url);
  }
  HrApprove(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlHrApprove,ids);
  }
   HrCancelApprove(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlHrCancelApprove,ids);
  }
   AccountantApprove(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urAccountantApprove,ids);
  }
   AccountantCancelApprove(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlAccountCancelApprove,ids);
  }
  DeleteAllocation(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlDeleteAllocation,ids);
  }
}
