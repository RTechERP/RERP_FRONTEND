import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AssetModalComponent } from '../assets-form.component';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class ModalService {        
 url = `${API_ORIGIN}api/Employee/getall`;
 urlunit = `${API_ORIGIN}api/AssetsUnit/getall`;
 urlDepartment = `${API_ORIGIN}api/Department/getall`;
 urlAssetManagement = `${API_ORIGIN}api/Assets/getallassetsmanagement`;
 urladdunit = `${API_ORIGIN}api/Unit/savedata`;
urlgetemployeetoadd=`${API_ORIGIN}api/Employee/get-all-with-details`;
urladdTassetCode=`${API_ORIGIN}api/Assets/generate-allocation-code-asset`;
urlgetCode=`${API_ORIGIN}api/AssetsAllocation/generate-allocation-code`;
urlpostassetallocation=`${API_ORIGIN}api/AssetsAllocation/SaveAllocation`;
constructor(private httpclient: HttpClient) { }
getDepartment(): Observable<any> {  
  return this.httpclient.get<any>(this.urlDepartment);
}
getEmployeeById(id: number): Observable<any> {
  const url = `${API_ORIGIN}api/Assets/getallocation?id=${id}`;
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
getTSCPCode(allocationDate: string): Observable<{ status: number, data: string }> {
  const params = new HttpParams().set('allocationDate', allocationDate);
  return this.httpclient.get<{ status: number, data: string }>(this.urlgetCode, { params });
}

getTassetCode(assetdate: string): Observable<string> {
  const params = new HttpParams().set('assetdate', assetdate);
  return this.httpclient.get(this.urladdTassetCode, { params, responseType: 'text' });
}
updateAssetAllocation(payload: any): Observable<any> {
    return this.httpclient.post(this.urlpostassetallocation, payload);
  }
}
