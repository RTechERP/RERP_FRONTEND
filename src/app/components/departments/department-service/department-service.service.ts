import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentServiceService {

  private _url = 'https://localhost:44365/api/';
  constructor(private http:HttpClient) { }

  getDepartments():Observable<any>{
    return this.http.get<any>(this._url + 'Department/getAll');
  }

  getDepartmentById(id:number):Observable<any>{
    return this.http.get<any>(this._url + 'Department/getDepartmentById?id=' + id);
  }

  createDepartment(department:any):Observable<any>{
    return this.http.post<any>(this._url + 'Department/saveDepartment', department);
  }


  deleteDepartment(id:number):Observable<any>{
    return this.http.delete<any>(this._url + 'Department/deleteDepartment?departmentID=' + id);
  }

  getEmployees(): Observable<any> {
    return this.http.get<any>(this._url + 'Employee/getAll');
  }
}