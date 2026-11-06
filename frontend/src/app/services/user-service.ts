import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  userUrl = environment.USERS;

  getUsers() {
    return this.http.get<UserResponse[]>(`${this.baseUrl}${this.userUrl.GET_ALL_USERS}`);
  }

  getWorkspaceUsers(wId: number) {
    return this.http.get<WorkspaceUser[]>(
      `${this.baseUrl}${this.userUrl.GET_ALL_USERS_WORKSPACE}${wId}`,
    );
  }
}
