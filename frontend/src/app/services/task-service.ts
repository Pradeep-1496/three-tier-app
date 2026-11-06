import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  taskUrl = environment.TASKS;

  getTasksFromList(lId: number) {
    return this.http.get(`${this.baseUrl}${this.taskUrl.GET_FROM_LIST}${lId}`);
  }

  // examples: [ "to-do", "in-progress", "completed" ]
  createTask(taskName: string, listId: number, status: string = 'to-do') {
    return this.http.post(`${this.baseUrl}${this.taskUrl.CREATE}`, { taskName, listId, status });
  }

  assignTask(userId: number, taskId: number) {
    return this.http.post(`${this.baseUrl}${this.taskUrl.ASSIGN_TASK}`, { userId, taskId });
  }

  removeTask(tId: number) {
    return this.http.delete(`${this.baseUrl}${this.taskUrl.DELETE}${tId}`);
  }

  updateStatus(tId: number, status: 'to-do' | 'in-progress' | 'completed') {
    return this.http.patch(`${this.baseUrl}${this.taskUrl.UPDATE}${tId}`, { status });
  }
}
