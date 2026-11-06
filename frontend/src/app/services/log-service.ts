import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface LogFilterOptions {
  type?: 'workspaces' | 'boards' | 'lists' | 'cards' | string;
  action?: 'create' | 'update' | 'delete' | string;
  userId?: number;
  workspaceId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  logUrl = environment.LOGS;

  /**
   * Get all activity logs with optional filtering
   */
  getLogs(filters?: LogFilterOptions) {
    let params = new HttpParams();

    if (filters) {
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.action) {
        params = params.set('action', filters.action);
      }
      if (filters.userId) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.workspaceId) {
        params = params.set('workspaceId', filters.workspaceId.toString());
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
    }

    return this.http.get<any[]>(`${this.baseUrl}${this.logUrl.GET_ALL}`, { params });
  }

  /**
   * Get logs for a specific workspace
   */
  getWorkspaceLogs(workspaceId: number, limit?: number) {
    return this.getLogs({ workspaceId, limit });
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: number, limit?: number) {
    return this.getLogs({ userId, limit });
  }

  /**
   * Get recent activity logs (last 50 by default)
   */
  getRecentActivity(limit: number = 50) {
    return this.getLogs({ limit });
  }

  /**
   * Format log timestamp for display
   */
  formatLogTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get log type badge color class
   */
  getLogTypeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      workspaces: 'type-workspaces',
      boards: 'type-boards',
      lists: 'type-lists',
      cards: 'type-cards',
      tasks: 'type-tasks',
    };
    return typeMap[type] || 'type-default';
  }
}
