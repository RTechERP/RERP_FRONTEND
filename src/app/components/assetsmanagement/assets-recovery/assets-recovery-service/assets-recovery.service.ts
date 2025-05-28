import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class AssetsRecoveryService {
  urlGetRecoveryCode= `${API_ORIGIN}api/AssetsRecovery/generaterecoverycode`;
  urlgetassetsrecovery = `${API_ORIGIN}api/AssetsRecovery/getTSAssetRecovery`;
  urlgetassetsrecoverydetail = `${API_ORIGIN}api/AssetsRecovery/getassetsrecoveryDetail`;
  constructor(private http: HttpClient) { }
  getAssetsRecovery(
    DateStart: string,
    DateEnd: string,
    EmployeeReturnID: number,
    EmployeeRecoveryID: number,
    Status: number,
    FilterText: string,
    PageSize: number,
    PageNumber: number,
  ): Observable<any> {
    const params = new HttpParams()
      .set('DateStart', DateStart)
      .set('DateEnd', DateEnd)
      .set('EmployeeReturnID', EmployeeReturnID)
      .set('EmployeeRecoveryID', EmployeeRecoveryID)
      .set('Status', Status)
      .set('FilterText', FilterText)
      .set('PageSize', PageSize)
      .set('PageNumber', PageNumber);
    return this.http.get<any>(this.urlgetassetsrecovery, { params });
  }
  getAssetsRecoveryDetail(id: number): Observable<any> {
    const url = `${this.urlgetassetsrecoverydetail}?id=${id}`;
    return this.http.get<any>(url);
  }
  getRecoveryCode(recoveryDate: string): Observable<{ status: number, data: string }> {
    const params = new HttpParams().set('recoveryDate', recoveryDate);
    return this.http.get<{ status: number, data: string }>(this.urlGetRecoveryCode, { params });
  }
}
