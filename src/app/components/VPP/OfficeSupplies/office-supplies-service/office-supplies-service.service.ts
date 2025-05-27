import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { API_URL } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class OfficeSuppliesService {
  private baseUrl = `${'https://localhost:7187'}/api/OfficeSupplies`;
  constructor(private httpclient: HttpClient) { }

  getdata(keyword: string): Observable<any> {
    return this.httpclient.get<any>(`${this.baseUrl}/getdataofficesupplies?keyword=${encodeURIComponent(keyword)}`);
  }

  getUnit(): Observable<any> {
    return this.httpclient.get<any>(`${this.baseUrl}/getdataofficesupplyunit`);
  }

  addUnit(data: any): Observable<any> {
    return this.httpclient.post<any>(`${this.baseUrl}/savedatofficesupplyunit`, data);
  }

  getdatafill(id: number): Observable<any> {
    return this.httpclient.get(`${this.baseUrl}/getbyidofficesupplies?id=${id}`);
  }

  adddata(data: any): Observable<any> {
    return this.httpclient.post(`${this.baseUrl}/addandupdate`, data);
  }

  updatedata(data: any): Observable<any> {
    return this.httpclient.post(`${this.baseUrl}/adddandupdate`, data);
  }

  deletedata(ids: number[]): Observable<any> {
    return this.httpclient.post(`${this.baseUrl}/deleteofficesupply`, ids);
  }

  searchdata(id: number): Observable<any> {
    return this.httpclient.get(`${this.baseUrl}/getbyidofficesupplies?id=${id}`);
  }
  nextCodeRTC(): Observable<any>{
    return this.httpclient.get<any>(`${this.baseUrl}/next-codeRTC`, { responseType: 'text' as 'json' });
  }
}