import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TSReportBrokenAssetService {
url='http://localhost:5207/api/Assets/getallreportbroken';
constructor(private httpclient:HttpClient) { }
getReportBroken():Observable<any>
{
  return this.httpclient.get<any>(this.url);
}
}
