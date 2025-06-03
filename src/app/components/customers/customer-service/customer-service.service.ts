import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerServiceService {
  private _url = 'https://localhost:44365/api/';
  constructor(private http:HttpClient) { }

  getCustomers():Observable<any>{
    return this.http.get<any>(this._url + 'Customer/getCustomer?groupId=0&employeeId=0&filterText=' + ' ' + '&pageNumber=1&pageSize=10000');
  }

  getCustomerContacts(customerId:number):Observable<any>{
    return this.http.get<any>(this._url + 'Customer/getCustomerContact?customerId=' + customerId);
  }
  getCustomerEmployeeSale(customerId:number):Observable<any>{
    return this.http.get<any>(this._url + 'Customer/getCustomerEmployeeByCustomerID?customerId=' + customerId);
  }

  getCustomerAddress(customerId:number):Observable<any>{
    return this.http.get<any>(this._url + 'Customer/getAddressStockByCustomerID?customerId=' + customerId);
  }

  getTeams():Observable<any>{
    return this.http.get<any>(this._url + 'GroupSale/getAll');
  }

  getEmployees():Observable<any>{
    return this.http.get<any>(this._url + 'Employee/getAll');
  }
  filterCustomer(teamId:number, employeeId:number, keyword:string):Observable<any>{
    return this.http.get<any>(this._url + 'Customer/getCustomer?groupId=' + teamId + '&employeeId=' + employeeId + '&filterText=' + keyword + '&pageNumber=1&pageSize=10000');
  }

  getBusinessField():Observable<any>{
    return this.http.get<any>(this._url + 'BusinessField/getAll');
  }

  getCustomerSpecialization():Observable<any>{
    return this.http.get<any>(this._url + 'CustomerSpecialization/getAll');
  }

  saveCustomerSpecialization(customerSpecialization: any): Observable<any> {
    return this.http.post<any>(this._url + 'CustomerSpecialization/saveCustomerSpecialization', customerSpecialization);
  }

  deleteCustomerSpecialization(customerSpecializationId:number):Observable<any>{
    return this.http.delete<any>(this._url + 'CustomerSpecialization/deleteCustomerSpecialization?customerSpecializationID=' + customerSpecializationId);
  }

  deleteCustomer(customerId:number):Observable<any>{
    return this.http.delete<any>(this._url + 'Customer/deleteCustomer?customerID=' + customerId);
  }

  saveCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this._url + 'Customer/saveCustomer', customer);
  }

  updateCustomer(id:number, customer: any): Observable<any> {
    return this.http.put<any>(this._url + 'Customer/updateCustomer/' + id, customer);
  }


  // Business Field Link methods
  createBusinessFieldLink(businessField: any): Observable<any> {
    return this.http.post<any>(this._url + 'BusinessField/createBusinessFieldLink', businessField);
  }

  updateBusinessFieldLink(businessField: any): Observable<any> {
    return this.http.put<any>(this._url + 'BusinessField/updateBusinessFieldLink', businessField);
  }

  getBusinessFieldLinkByCustomerID(customerId: number) {
    return this.http.get<any>(this._url + 'BusinessFieldLink/getBusinessFieldLinkByCustomerID?customerID=' + customerId);
  }


  getCustomersToExcel(): Observable<any> {
    return this.http.get<any>(this._url + 'Customer/getCustomerToExcel?groupId=0&employeeId=0&filterText=' + ' ' + '&pageNumber=1&pageSize=10000');
  }
}
