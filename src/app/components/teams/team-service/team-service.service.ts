import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamServiceService {
  private apiUrl = 'https://localhost:44365/api/';

  constructor(private http: HttpClient) { }

  getTeams(departmentID: number) : Observable<any> {
    return this.http.get(this.apiUrl + 'Team/getTeamByDepartmentID?departmentID=' + departmentID);
  }

  getUserTeam(teamID: number, departmentID: number) : Observable<any> {
    return this.http.get(this.apiUrl + 'Team/getUserTeam?teamID=' + teamID + '&departmentID=' + departmentID);
  }

  getEmployees() : Observable<any> {
    return this.http.get(this.apiUrl + 'Employee/getall');
  }
  getProjectTypes() : Observable<any> {
    return this.http.get(this.apiUrl + 'ProjectType/getallprojecttype');
  }
  saveTeam(team: any) : Observable<any> {
    return this.http.post(this.apiUrl + 'Team/savedata', team);
  }
  deleteTeam(teamID: number) : Observable<any> {
    return this.http.delete(this.apiUrl + 'Team/deleteTeam?teamID=' + teamID);
  }

  addEmployeesToTeam(request: { TeamID: number, ListEmployeeID: number[] }): Observable<any> {
    return this.http.post(this.apiUrl + 'Team/addEmployeeToTeam', request);
  }
  removeEmployeeFromTeam(userTeamLinkID: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'Team/removeEmployeeFromTeam?userTeamLinkID=' + userTeamLinkID);
  }
  getEmployeeByDepartmentID(departmentID: number, userTeamID: number): Observable<any> {
    return this.http.get(this.apiUrl + 'Team/getEmployeeByDepartmentID?departmentID=' + departmentID + '&userTeamID=' + userTeamID);
  }
}
