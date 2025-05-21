import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

    private _url =   'http://localhost:5207/api/Employee/getall';
  constructor(private http:HttpClient) { }
urlbyid = 'http://localhost:5207/api/Employee/getbyid';


  //get danh sách menu
  getEmployee():Observable<any>{
    return this.http.get<any>(this._url);
  }
// assets/services/employee.service.ts
getEmployeesByIDs(ids: number[]): Observable<any> {
  return this.http.post<any>(`${this.urlbyid}/batch`, ids);
}

}
