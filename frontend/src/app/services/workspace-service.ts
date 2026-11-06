import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  workspaceUrl = environment.WORKSPACES;
  workspaceMemberUrl = environment.WORKSPACES_MEMBER;

  currentWSId = new BehaviorSubject<number | null>(
    localStorage.getItem('currentWSId') ? Number(localStorage.getItem('currentWSId')) : null,
  );

  getCurrentWSId$ = this.currentWSId.asObservable();

  setCurrentWSId(wsId: number) {
    this.currentWSId.next(wsId);
    localStorage.setItem('currentWSId', String(wsId));
  }

  createWorkspace(name: string) {
    return this.http.post(`${this.baseUrl}${this.workspaceUrl.CREATE}`, { name });
  }

  getAllWorkspace() {
    return this.http.get(`${this.baseUrl}${this.workspaceUrl.GET_ALL}`);
  }

  getWholeWorkspace(wId: number) {
    return this.http.get(`${this.baseUrl}${this.workspaceUrl.GET_WHOLE_WORKSPACE}${wId}`);
  }

  removeWorkspace(wId: number) {
    return this.http.delete(`${this.baseUrl}${this.workspaceUrl.DELETE}${wId}`);
  }

  updateMember(wsId: number, userId: number, role: 'Owner' | 'Member') {
    const payload = {
      wsId,
      userId,
      role,
    };

    this.http.patch(`${this.baseUrl}${this.workspaceUrl.DELETE}`, payload);
  }
}
