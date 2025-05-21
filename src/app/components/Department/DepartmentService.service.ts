import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepartmentServiceService {
  url = 'http://localhost:5207/api/Department/getall';


constructor(private httpclient: HttpClient) { }
getDepartment(): Observable<any> {
  return this.httpclient.get<any>(this.url);  
}
}
