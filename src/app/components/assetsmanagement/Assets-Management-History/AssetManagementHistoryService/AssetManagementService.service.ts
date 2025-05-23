import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class AssetManagementServiceService {
url = `${API_ORIGIN}api/Assets/getTSAssestAllocation`;
constructor(private httpclient:HttpClient) { }
getAssetAllocation():Observable<any>
{
  return this.httpclient.get<any>(this.url);
}

}
