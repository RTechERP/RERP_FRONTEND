import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class UnitService {
url = `${API_ORIGIN}api/Unit/getall`;
urlsave=`${API_ORIGIN}api/Unit/savedata`;
constructor(private httpclient: HttpClient) {

 }
 SaveUnit(unit : any):Observable<any>
 {
return this.httpclient.post<any>(this.urlsave,unit)
 }
 getUnit():Observable<any>{
  return this.httpclient.get<any>(this.url);
 }

}
 