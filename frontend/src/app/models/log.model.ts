export interface LogResponse {
  logId: number;
  actionName: string;
  type: 'workspaces' | 'boards' | 'lists' | 'cards' | string;
  action: 'create' | 'update' | 'delete' | string;
  actionBy: number;
  created_at: string;
}
