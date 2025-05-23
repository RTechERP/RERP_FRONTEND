import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({ providedIn: 'root' })
export class AssetAllocationService {
  private urlMaster = `${API_ORIGIN}api/Assets/getTSAssestAllocation`;
  private urlDetail = `${API_ORIGIN}api/Assets/getassetsallocationdetail`;
urlHrApprove=`${API_ORIGIN}api/Assets/HRApproved`;
urlHrCancelApprove=`${API_ORIGIN}api/Assets/HRCancelApproved `;
urAccountantApprove=`${API_ORIGIN}api/Assets/AccountantApproved`;
urlAccountCancelApprove=`${API_ORIGIN}api/Assets/AccountantCancelApproved`;
urlDeleteAllocation=`${API_ORIGIN}api/Assets/deleteAssetAllocation`;
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
  return this.http.post<any>(`${API_ORIGIN}api/Assets/UpdateApprovalStatus`, updateapprove);
}

  DeleteAllocation(ids:number[]):Observable<any>
  {
    return this.http.post<any>(this.urlDeleteAllocation,ids);
  }
}
