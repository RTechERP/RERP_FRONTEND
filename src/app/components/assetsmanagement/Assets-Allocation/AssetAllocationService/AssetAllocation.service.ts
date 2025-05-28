import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({ providedIn: 'root' })
export class AssetAllocationService {
  private urlMaster = `${API_ORIGIN}api/AssetsAllocation/getTSAssestAllocation`;
  private urlDetail = `${API_ORIGIN}api/AssetsAllocation/getassetsallocationdetail`;
private urldelete=`${API_ORIGIN}api/AssetsAllocation/savedata`;
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
updateApproval(data: { id: number, status?: number, isApproveAccountant?: boolean }[]): Observable<any> {
  return this.http.post<any>(`${API_ORIGIN}api/AssetsAllocation/savedata`, data);
}

}
