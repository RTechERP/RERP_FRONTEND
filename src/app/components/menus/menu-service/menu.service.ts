import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ORIGIN } from '../../../app.config';
@Injectable({
  providedIn: 'root'
})
export class MenuService {

    private _url = `${API_ORIGIN}api/menu/`;
  constructor(private http:HttpClient) { }



  //get danh sách menu
  getMenus():Observable<any>{
    return this.http.get<any>(this._url + 'getall');
  }
}
