import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

    private _url = 'https://localhost:40687/api/menu/';
  constructor(private http:HttpClient) { }



  //get danh sách menu
  getMenus():Observable<any>{
    return this.http.get<any>(this._url + 'getall');
  }
}
