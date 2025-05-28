import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { API_ORIGIN } from '../../app.config';
@Injectable({
  providedIn: 'root'
})
export class DepartmentServiceService {
  url = `${API_ORIGIN}api/Department/getall`;


constructor(private httpclient: HttpClient) { }
getDepartment(): Observable<any> {
  return this.httpclient.get<any>(this.url);  
}
}
