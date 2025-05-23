import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class AssetStatusService {
  url=`${API_ORIGIN}api/Assets/getstatus`;

constructor(private hhtpclient:HttpClient) { }
getStatus():Observable<any>
{
  return this.hhtpclient.get<any>(this.url);
}

}
