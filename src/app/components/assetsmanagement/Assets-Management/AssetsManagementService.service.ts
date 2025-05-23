import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { API_ORIGIN } from '../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class AssetsManagementService {
  urldeleteassetmanagement=`${API_ORIGIN}api/Assets/deleteAssetManagement`;
   url = `${API_ORIGIN}api/Assets/getassets`;
  constructor(private httpclient: HttpClient) { }
  saveAssets(assets: any): Observable<any> {
    const url = `${API_ORIGIN}api/Assets/savedata`;
    return this.httpclient.post<any>(url, assets);
  }
  getEmployeeById(id: number): Observable<any> {
    const url = `${API_ORIGIN}api/Assets/getallocation?ID=${id}`;
    return this.httpclient.get<any>(url);
  }
  dt: any[] = [
    { id: 1, name: "A" }
  ];
  baoHongTaiSan(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpclient.post<any>(
      `${API_ORIGIN}api/Assets/savedatareportbroken`,
      data,
      { headers }
    );
  }
  baoMatTaiSan(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpclient.post<any>(
      `${API_ORIGIN}api/Assets/savedatareportlost`,
      data,
      { headers }
    );
  }
  getAssetsManagement(
    FilterText: string,
    PageNumber: number,
    PageSize: number,
    DateStart?: string | null,
    DateEnd?: string | null,
    Status?: string,
    Department?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('FilterText', FilterText)
      .set('PageNumber', PageNumber.toString())
      .set('PageSize', PageSize.toString());

    if (DateStart) { params = params.set('DateStart', DateStart); }
    if (DateEnd) { params = params.set('DateEnd', DateEnd); }
    if (Status) { params = params.set('Status', Status); }
    if (Department) { params = params.set('Department', Department); }

    return this.httpclient.get<any>(this.url, { params });
  }
  deleteAsset(id: number): Observable<any> {
    const url = `${API_ORIGIN}api/Assets`;
    return this.httpclient.delete<any>(`${url}/${id}`);
  }
   DeleteAssetManagement(ids:number[]):Observable<any>
  {
    return this.httpclient.post<any>(this.urldeleteassetmanagement,ids);
  }
}
