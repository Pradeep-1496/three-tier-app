import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  boardUrl = environment.BOARDS;

  getBoardsFromWorkspace(wsId: number) {
    return this.http.get<BoardResponse[]>(`${this.baseUrl}${this.boardUrl.GET_FROM_WS}${wsId}`);
  }

  createBoard(boardName: string, wsId: number) {
    return this.http.post(`${this.baseUrl}${this.boardUrl.CREATE}`, { boardName, wsId });
  }

  removeBoard(bId: number) {
    return this.http.delete(`${this.baseUrl}${this.boardUrl.DELETE}${bId}`);
  }
}
