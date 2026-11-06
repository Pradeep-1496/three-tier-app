import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  commentUrl = environment.COMMENTS;

  createComment(commentContent: string, taskId: number) {
    return this.http.post(`${this.baseUrl}${this.commentUrl.CREATE}`, { commentContent, taskId });
  }
}
