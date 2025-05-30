import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'https://localhost:44365/api/Project/';

  constructor(private http: HttpClient) {}

  GlobalEmployeeId: number = 78;
  // Lấy danh sách thư mục dự án
  getFolders(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'getFolders');
  }

  // Danh sách nhân viên khi thêm dự án
  getPMs(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'getPMs');
  }

  // Danh sách khách hàng
  getCustomers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'getCustomers');
  }

  // Danh sách nhân viên khi thêm dự án lấy table 2 phụ trách sale/ phụ trách kỹ thuật/ leader
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'getUsers');
  }

  // Danh sách loại dự án ProjectType
  getProjectTypes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'getProjectTypes');
  }

  // Danh sách loại dự án ProjectTypeLink
  getProjectTypeLinks(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectTypeLinks/${id}`);
  }

  // Load Hạng mục công việc
  getProjectItems(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectItems/${id}`);
  }

  // Load lĩnh vực kinh doanh dự án
  getBusinessFields(): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getBusinessFields`);
  }

  // Lấy trạng thái dụ án
  getProjectStatus(): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectStatus`);
  }

  // modal lấy danh sách nhóm file
  getGroupFiles(): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getGroupFiles`);
  }

  // modal lấy danh sách FirmBase
  getFirmBases(): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getFirmBases`);
  }

  // modal lấy kiểu dự án Base
  getProjectTypeBases(): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectTypeBases`);
  }

  // modal lấy người dùng dự án
  getProjectUsers(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectUsers/${id}`);
  }

  //modal lấy dữ liệu FollowProjectBase
  getFollowProjectBases(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getFollowProjectBases/${id}`);
  }

  // Danh sách dự án
  getAPIProjects(): string {
    return this.apiUrl + 'getProjects';
  }

  // Lấy chi tiết công việc
  getProjectDetails(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProjectDetails/${id}`);
  }

  // lấy chi tiết dự án
  getProject(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `getProject/${id}`);
  }

  // lấy mã dự án
  getProjectCodeModal(
    projectId: number,
    shortName: string,
    projectType: number
  ): Observable<any> {
    return this.http.get<any>(
      this.apiUrl +
        `getProjectCodeModal/${projectId}/${shortName}/${projectType}`
    );
  }

  // Kiểm tra đã có mã dự án chưa
  checkProjectCode(projectId: number, projectCode: string): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + `checkProjectCode/${projectId}/${projectCode}`
    );
  }

  // Xóa dự án
  deletedProject(ids: number[]): Observable<any> {
    const idArray = ids.join(',');
    return this.http.get<any>(this.apiUrl + `deletedProject/${idArray}`);
  }

  // Lưu dữ liệu dự án
  saveProject(project: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `saveProject`, project);
  }

  // Lưu dữ liệu trạng thái dự án
  saveProjectStatus(Stt: any, statusName: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `saveProjectStatus?Stt=${Stt}&statusName=${statusName}`, {});
  }
}
