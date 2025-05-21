import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AssetModalComponent } from '../assets-form.component';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {        
 url = 'http://localhost:5207/api/Employee/getall';
 urlunit = 'http://localhost:5207/api/Unit/getall';
 urlDepartment = 'http://localhost:5207/api/Department/getall';
 urlAssetManagement = 'http://localhost:5207/api/Assets/getallassetsmanagement';
 urladdunit = 'http://localhost:5207/api/Unit/savedata';
urlgetemployeetoadd='http://localhost:5207/api/Employee/get-all-with-details';
urlgetCode='http://localhost:5207/api/Assets/generate-allocation-code';
urlpostassetallocation='http://localhost:5207/api/Assets/SaveAllocation';
constructor(private httpclient: HttpClient) { }
getDepartment(): Observable<any> {  
  return this.httpclient.get<any>(this.urlDepartment);
}
getEmployeeById(id: number): Observable<any> {
  const url = `http://localhost:5207/api/Assets/getallocation?id=${id}`;
  return this.httpclient.get<any>(url);
}
getEmployeetoadd():Observable<any>
{
  return this.httpclient.get<any>(this.urlgetemployeetoadd);
}
getEmployee(): Observable<any> {
  return this.httpclient.get<any>(this.url);
}
getUnit(): Observable<any> {
  return this.httpclient.get<any>(this.urlunit);

}
  postassetallocation(assetsallocation:any):Observable<any>
  {
    return this.httpclient.post<any>(this.urlpostassetallocation,assetsallocation)
  }
getMaxAssetId(): Observable<number> {
  return this.httpclient.get<number>(this.urlAssetManagement);
}
addunitt(unit:any): Observable<any> {
  return this.httpclient.post<any>(this.urladdunit, unit);
}
getTSCPCode(allocationDate: string): Observable<string> {
  const params = new HttpParams().set('allocationDate', allocationDate);
  return this.httpclient.get(this.urlgetCode, { params, responseType: 'text' });
}

}
