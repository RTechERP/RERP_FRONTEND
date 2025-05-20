import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class OfficeSupplyUnitServiceService {

   constructor(private httpclient: HttpClient) { }
  getdata(): Observable<any> {
    return this.httpclient.get<any>(`https://localhost:44365/api/dsVpp/getu`);
  }
  updatedata(data:any): Observable<any>{
    return this.httpclient.post<any>('https://localhost:44365/api/dsVpp/savedatas',data);
  }
   getdatafill(id:number):Observable<any>{
    return this.httpclient.get('https://localhost:44365/api/dsVpp/getbyid?id='+id);
   }
}
