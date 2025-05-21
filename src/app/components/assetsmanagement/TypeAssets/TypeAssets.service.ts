import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TypeAssetsService {
 url = 'http://localhost:5207/api/Assets/gettype';

constructor(private httpclient: HttpClient) { }

getTypeAssets(): Observable<any> {
  return this.httpclient.get<any>(this.url);
}
}
