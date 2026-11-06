import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface WorkspaceMember {
  userId: number;
  email: string;
  role: 'Owner' | 'Member';
  createdAt: string;
}

export interface AssignMemberPayload {
  wsId: number;
  userId: number;
  role: 'Owner' | 'Member';
}

export interface UpdateMemberPayload {
  wsId: number;
  userId: number;
  role: 'Owner' | 'Member';
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceMemberService {
  http = inject(HttpClient);

  baseUrl = environment.BASE_URL;
  workspaceMemberUrl = environment.WORKSPACES_MEMBER;

  /**
   * Assign a user to a workspace with a specific role
   */
  assignUser(wsId: number, userId: number, role: 'Owner' | 'Member') {
    const payload: AssignMemberPayload = { wsId, userId, role };
    return this.http.post<WorkspaceMember>(
      `${this.baseUrl}${this.workspaceMemberUrl.ASSIGN_MEMBER}`,
      payload,
    );
  }

  /**
   * Update a member's role in a workspace
   */
  updateMember(wsId: number, userId: number, role: 'Owner' | 'Member') {
    const payload: UpdateMemberPayload = { wsId, userId, role };
    return this.http.patch<WorkspaceMember>(
      `${this.baseUrl}${this.workspaceMemberUrl.UPDATE}`,
      payload,
    );
  }

  /**
   * Remove a member from a workspace
   */
  removeMember(wsId: number, userId: number) {
    const payload = { wsId, userId };
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}${this.workspaceMemberUrl.DELETE}`,
      {
        body: payload,
      },
    );
  }

  /**
   * Get all members of a workspace
   */
  getWorkspaceMembers(wsId: number) {
    return this.http.get<WorkspaceMember[]>(
      `${this.baseUrl}${this.workspaceMemberUrl.ASSIGN_MEMBER.replace(
        '/assign',
        '',
      )}/${wsId}`,
    );
  }

  /**
   * Check if the current user is the owner of the workspace
   */
  isWorkspaceOwner(members: WorkspaceMember[], currentUserEmail: string): boolean {
    const currentMember = members.find(
      (m) => m.email === currentUserEmail,
    );
    return currentMember?.role === 'Owner';
  }

  /**
   * Get a specific member by user ID from workspace members
   */
  getMember(members: WorkspaceMember[], userId: number): WorkspaceMember | undefined {
    return members.find((m) => m.userId === userId);
  }

  /**
   * Filter members by role
   */
  getMembersByRole(members: WorkspaceMember[], role: 'Owner' | 'Member'): WorkspaceMember[] {
    return members.filter((m) => m.role === role);
  }

  /**
   * Count members by role
   */
  countMembersByRole(members: WorkspaceMember[], role: 'Owner' | 'Member'): number {
    return this.getMembersByRole(members, role).length;
  }
}
