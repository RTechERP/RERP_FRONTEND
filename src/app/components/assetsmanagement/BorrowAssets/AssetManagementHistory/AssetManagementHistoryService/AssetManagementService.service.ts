import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetManagementServiceService {
url = 'http://localhost:5207/api/Assets/getTSAssestAllocation';
constructor(private httpclient:HttpClient) { }
getAssetAllocation():Observable<any>
{
  return this.httpclient.get<any>(this.url);
}

}
