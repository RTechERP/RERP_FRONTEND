import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
url = 'http://localhost:5207/api/Unit/getall';
urlsave='http://localhost:5207/api/Unit/savedata';
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
 