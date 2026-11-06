import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  listUrl = environment.LISTS;

  getFromBoard(bId: number) {
    return this.http.get<ListResponse[]>(`${this.baseUrl}${this.listUrl.GET_FROM_BOARD}${bId}`);
  }

  createList(listName: string, boardId: number) {
    return this.http.post(`${this.baseUrl}${this.listUrl.CREATE}`, { listName, boardId });
  }

  removeList(lId: number) {
    return this.http.delete(`${this.baseUrl}${this.listUrl.DELETE}${lId}`);
  }
}
