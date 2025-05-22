import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  url = 'http://localhost:5207/api/Assets/getall';
  constructor(private httpclient: HttpClient) { }
  getAssets(): Observable<any> {
    return this.httpclient.get<any>(this.url);

  }
}
