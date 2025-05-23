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
updateApprovalStatus(ids: number[], action: string): Observable<any> {
  const updateapprove = {
    ids: ids,
    action: action
  };
  return this.http.post<any>('http://localhost:5207/api/Assets/UpdateApprovalStatus', updateapprove);
}

  DeleteAllocation(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlDeleteAllocation,ids);
  }
}
