import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetStatusService {
  url='http://localhost:5207/api/Assets/getstatus';

constructor(private hhtpclient:HttpClient) { }
getStatus():Observable<any>
{
  return this.hhtpclient.get<any>(this.url);
}

}
