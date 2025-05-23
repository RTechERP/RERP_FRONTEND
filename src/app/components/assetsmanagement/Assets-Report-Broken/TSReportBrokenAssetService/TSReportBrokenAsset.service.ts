import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class TSReportBrokenAssetService {
url=`${API_ORIGIN}api/Assets/getallreportbroken`;
constructor(private httpclient:HttpClient) { }
getReportBroken():Observable<any>
{
  return this.httpclient.get<any>(this.url);
}
}
