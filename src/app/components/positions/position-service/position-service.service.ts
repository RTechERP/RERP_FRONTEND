import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PositionServiceService {

  private _url = 'https://localhost:44365/api/';
  constructor(private http: HttpClient) {
    
  }
  getPositionContract() : Observable<any> {
    return this.http.get<any>(this._url + 'Position/getPositionContract');
  }
  getPositionInternal() : Observable<any> {
    return this.http.get<any>(this._url + 'Position/getPositionInternal');
  }

  savePositionContract(data: any): Observable<any> {
    return this.http.post<any>(this._url + 'Position/savePositionContract', data);
  }
  savePositionInternal(data: any): Observable<any> {
    return this.http.post<any>(this._url + 'Position/savePositionInternal', data);
  }
  deletePositionContract(id: number): Observable<any> {
    return this.http.delete<any>(this._url + 'Position/deletePositionContract?positionContractId=' + id);
  }
  deletePositionInternal(id: number): Observable<any> {
    return this.http.delete<any>(this._url + 'Position/deletePositionInternal?positionInternalId=' + id);
  }
}
