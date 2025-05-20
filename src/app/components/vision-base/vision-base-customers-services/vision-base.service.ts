import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisionBaseService {
  private _url = 'https://localhost:7187/api/VisionBase/';
  constructor(private http: HttpClient) { }
    getPart(id: number): Observable<any> {
    return this.http.get<any>('https://localhost:7187/api/POKH/GetPart', {
      params: {
        id: id.toString()
      }
    });
  }
}
