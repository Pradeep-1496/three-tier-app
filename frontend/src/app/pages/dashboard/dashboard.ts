import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logout } from '../auth/logout/logout';
import { WorkspaceService } from '../../services/workspace-service';
import { BoardService } from '../../services/board-service';
import { ListService } from '../../services/list-service';
import { TaskService } from '../../services/task-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { CommentService } from '../../services/comment-service';
import { TimeAgoPipe } from './time-ago.pipe';

import { WorkspaceMemberService } from '../../services/workspace-member-service';
import { LogService, LogFilterOptions } from '../../services/log-service';
import { LogResponse } from '../../models/log.model';

type ModalType =
  | 'createWorkspace'
  | 'assignMember'
  | 'createBoard'
  | 'createList'
  | 'createTask'
  | 'assignTask'
  | 'createComment'
  | 'viewLogs'
  | 'updateMemberRole'
  | 'deleteWorkspace'
  | 'manageMembers'
  | 'updateTask'
  | null;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Logout, TimeAgoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  ngOnInit(): void {
    this.getWorkspace();
    this.getAllUsers();

    const currentId = this.workspaceService.currentWSId.value;
    if (currentId) {
      this.loadWorkspaceData(currentId);
    }
  }

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │   Services                                                                 │
  // └────────────────────────────────────────────────────────────────────────────┘
  workspaceService = inject(WorkspaceService);
  workspaceMemberService = inject(WorkspaceMemberService);
  boardService = inject(BoardService);
  listService = inject(ListService);
  taskService = inject(TaskService);
  commentService = inject(CommentService);
  userService = inject(UserService);
  logService = inject(LogService);

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │   Signals                                                                  │
  // └────────────────────────────────────────────────────────────────────────────┘
  Workspace = signal<WorkspaceResponse[]>([]);
  WorkspaceUser = signal<any[]>([]);
  Users = signal<any[]>([]);
  Boards = signal<BoardResponse[]>([]);
  Lists = signal<ListResponse[]>([]);
  Tasks = signal<any[]>([]);
  WholeData = signal<any>({});

  // Log signals
  ActivityLogs = signal<LogResponse[]>([]);
  isLoadingLogs = signal(false);
  logFilter = signal<LogFilterOptions>({});

  // Computed statistics
  totalBoards = computed(() => this.WholeData()?.workspace?.boards?.length ?? 0);
  totalLists = computed(
    () =>
      this.WholeData()?.workspace?.boards?.reduce(
        (sum: number, board: any) => sum + (board.lists?.length ?? 0),
        0,
      ) ?? 0,
  );
  totalTasks = computed(
    () =>
      this.WholeData()?.workspace?.boards?.reduce(
        (sum: number, board: any) =>
          sum +
          (board.lists?.reduce((lSum: number, list: any) => lSum + (list.tasks?.length ?? 0), 0) ??
            0),
        0,
      ) ?? 0,
  );

  currentWorkspaceId!: number;
  selectedWorkspaceId = signal<number | null>(null);
  activeModal = signal<ModalType>(null);
  selectedBoardId: number | null = null;
  selectedListId: number | null = null;
  selectedTaskId: number | null = null;
  selectedMemberId: number | null = null;

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │   Forms                                                                    │
  // └────────────────────────────────────────────────────────────────────────────┘
  AssignMemberForm = new FormGroup({
    userId: new FormControl(null, [Validators.required, Validators.min(1)]),
    role: new FormControl(null, [Validators.required]), //Role: enum of ['Owner', 'Member']
  });
  CreateWorkspaceForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  CreateBoardForm = new FormGroup({
    boardName: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  CreateListForm = new FormGroup({
    listName: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  CreateTaskForm = new FormGroup({
    taskName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    status: new FormControl('pending'),
  });
  AssignTaskForm = new FormGroup({
    userId: new FormControl(null, [Validators.required, Validators.min(1)]),
  });
  CreateCommentForm = new FormGroup({
    commentContent: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  UpdateMemberRoleForm = new FormGroup({
    role: new FormControl(null, [Validators.required]),
  });
  UpdateTaskStatusForm = new FormGroup({
    status: new FormControl(null, [Validators.required]),
  });
  DeleteWorkspaceForm = new FormGroup({
    confirmEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │ Modal Methods                                                              │
  // └────────────────────────────────────────────────────────────────────────────┘
  openModal(modal: ModalType): void {
    this.activeModal.set(modal);
  }

  openAssignMemberModal(): void {
    this.resetForm();
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.openModal('assignMember');
  }

  openCreateBoardModal(): void {
    this.resetForm();
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.openModal('createBoard');
  }

  openCreateWorkspaceModal(): void {
    this.resetForm();
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.openModal('createWorkspace');
  }

  openCreateListModal(boardId: number): void {
    this.resetForm();
    this.selectedBoardId = boardId;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.openModal('createList');
  }

  openCreateTaskModal(boardId: number, listId: number): void {
    this.resetForm();
    this.selectedBoardId = boardId;
    this.selectedListId = listId;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.openModal('createTask');
  }

  openAssignTaskModal(taskId: number): void {
    this.resetForm();
    this.selectedTaskId = taskId;
    this.openModal('assignTask');
  }

  openCreateCommentModal(taskId: number): void {
    this.resetForm();
    this.selectedTaskId = taskId;
    this.openModal('createComment');
  }

  openUpdateTaskModal(taskId: number): void {
    this.resetForm();
    this.selectedTaskId = taskId;
    this.openModal('updateTask');
  }

  openUpdateMemberRoleModal(memberId: number): void {
    this.resetForm();
    this.selectedMemberId = memberId;
    const member = this.WorkspaceUser().find((m) => m.userId === memberId);
    if (member) {
      this.UpdateMemberRoleForm.patchValue({ role: member.role });
    }
    this.openModal('updateMemberRole');
  }

  openLogViewerModal(): void {
    this.resetForm();
    this.loadActivityLogs();
    this.openModal('viewLogs');
  }

  openDeleteWorkspaceModal(): void {
    this.resetForm();
    this.openModal('deleteWorkspace');
  }

  openManageMembersModal(): void {
    this.resetForm();
    this.openModal('manageMembers');
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.AssignMemberForm.reset();
    this.CreateWorkspaceForm.reset();
    this.CreateBoardForm.reset();
    this.CreateListForm.reset();
    this.CreateTaskForm.reset();
    this.AssignTaskForm.reset();
    this.CreateCommentForm.reset();
    this.UpdateMemberRoleForm.reset();
    this.UpdateTaskStatusForm.reset();
    this.DeleteWorkspaceForm.reset();
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
  }

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │ Workspace Selection Handler                                                │
  // └────────────────────────────────────────────────────────────────────────────┘
  onWorkspaceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const workspaceId = Number(selectElement.value);
    this.closeModal(); // Close any open modal before switching
    if (workspaceId) {
      this.loadWorkspaceData(workspaceId);
    } else {
      this.clearWorkspaceData();
    }
  }

  private loadWorkspaceData(workspaceId: number): void {
    this.currentWorkspaceId = workspaceId;
    this.selectedWorkspaceId.set(workspaceId);
    // Reset selection state for new workspace
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
    this.getWorkspaceUser(workspaceId);
    this.workspaceService.setCurrentWSId(workspaceId);

    this.workspaceService.getWholeWorkspace(workspaceId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.WholeData.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private clearWorkspaceData(): void {
    this.WholeData.set({});
    this.WorkspaceUser.set([]);
    this.selectedWorkspaceId.set(null);
    this.selectedBoardId = null;
    this.selectedListId = null;
    this.selectedTaskId = null;
    this.selectedMemberId = null;
  }

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │ Get Methods                                                                │
  // └────────────────────────────────────────────────────────────────────────────┘

  getWorkspace() {
    this.workspaceService.getAllWorkspace().subscribe({
      next: (res: any) => {
        console.log(res);
        this.Workspace.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getBoards(wsId: number) {
    this.boardService.getBoardsFromWorkspace(wsId).subscribe({
      next: (res) => {
        console.log(res);
        this.Boards.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getLists(bId: number) {
    this.listService.getFromBoard(bId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.Lists.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getTask(Lid: number) {
    this.taskService.getTasksFromList(Lid).subscribe({
      next: (res: any) => {
        console.log(res);
        this.Tasks.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getAllUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        console.log(res);
        this.Users.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getWorkspaceUser(wId: number) {
    this.userService.getWorkspaceUsers(wId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.WorkspaceUser.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getWholeWorkspace(wId: number) {
    this.loadWorkspaceData(wId);
  }

  private refreshCurrentWorkspace(): void {
    if (this.currentWorkspaceId) {
      this.loadWorkspaceData(this.currentWorkspaceId);
    }
  }

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │   Log Methods                                                              │
  // └────────────────────────────────────────────────────────────────────────────┘

  loadActivityLogs(): void {
    this.isLoadingLogs.set(true);
    const filters: LogFilterOptions = {
      ...this.logFilter(),
      limit: 50,
    };

    if (this.currentWorkspaceId) {
      filters.workspaceId = this.currentWorkspaceId;
    }

    this.logService.getLogs(filters).subscribe({
      next: (res: LogResponse[]) => {
        this.ActivityLogs.set(res);
        this.isLoadingLogs.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingLogs.set(false);
      },
    });
  }

  refreshLogs(): void {
    this.loadActivityLogs();
  }

  filterLogs(type?: string): void {
    this.logFilter.update((f) => ({ ...f, type: type || undefined }));
    this.loadActivityLogs();
  }

  getLogTypeClass(type: string): string {
    return this.logService.getLogTypeClass(type);
  }



  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │   Post Methods                                                             │
  // └────────────────────────────────────────────────────────────────────────────┘

  createComment(taskId: number | null) {
    if (!taskId) return;
    this.commentService
      .createComment(this.CreateCommentForm.value.commentContent || '', taskId)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.CreateCommentForm.reset();
          this.closeModal();
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  assignTask(taskId: number | null) {
    if (!taskId) return;
    this.taskService.assignTask(Number(this.AssignTaskForm.value.userId), taskId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.AssignTaskForm.reset();
        this.closeModal();
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  createTask(listId: number | null) {
    if (!listId) return;
    this.taskService
      .createTask(
        this.CreateTaskForm.value.taskName || '',
        listId,
        this.CreateTaskForm.value.status || 'pending',
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.CreateTaskForm.reset();
          this.closeModal();
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  createList(boardId: number | null) {
    if (!boardId) return;
    this.listService.createList(this.CreateListForm.value.listName || '', boardId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.CreateListForm.reset();
        this.closeModal();
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  createWorkspace() {
    if (this.CreateWorkspaceForm.valid) {
      this.workspaceService.createWorkspace(String(this.CreateWorkspaceForm.value.name)).subscribe({
        next: (res: any) => {
          console.log(res);
          this.CreateWorkspaceForm.reset();
          this.closeModal();
          this.getWorkspace();
          // Auto-select the newly created workspace if ID is available
          const newWorkspaceId = res?.workspaceId || res?.id;
          if (newWorkspaceId) {
            this.loadWorkspaceData(newWorkspaceId);
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.CreateWorkspaceForm.markAllAsTouched();
    }
  }

  assignMember(wsId: number | null, role: any) {
    if (!wsId) return;
    if (this.AssignMemberForm.valid && role) {
      this.workspaceMemberService
        .assignUser(wsId, Number(this.AssignMemberForm.value.userId), role as 'Owner' | 'Member')
        .subscribe({
          next: (res) => {
            console.log(res);
            this.AssignMemberForm.reset();
            this.closeModal();
            this.refreshCurrentWorkspace();
          },
          error: (err) => {
            console.error(err);
          },
        });
    } else {
      this.AssignMemberForm.markAllAsTouched();
    }
  }

  updateMemberRole(wsId: number | null, memberId: number | null) {
    if (!wsId || !memberId) return;
    const role = this.UpdateMemberRoleForm.value.role;
    if (this.UpdateMemberRoleForm.valid && role) {
      this.workspaceMemberService.updateMember(wsId, memberId, role).subscribe({
        next: (res) => {
          console.log(res);
          this.UpdateMemberRoleForm.reset();
          this.closeModal();
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.UpdateMemberRoleForm.markAllAsTouched();
    }
  }

  updateTaskStatus(tId: number | null) {
    if (!tId) return;
    const status = this.UpdateTaskStatusForm.value.status;

    if (this.UpdateTaskStatusForm.valid && status) {
      this.taskService.updateStatus(tId, status).subscribe({
        next: (res) => {
          console.log(res);
          this.UpdateTaskStatusForm.reset();
          this.closeModal();
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  removeMember(wsId: number | null, userId: number | null) {
    if (!wsId || !userId) return;
    if (confirm('Are you sure you want to remove this member from the workspace?')) {
      this.workspaceMemberService.removeMember(wsId, userId).subscribe({
        next: (res) => {
          console.log(res);
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  createBoard(wsId: number | null) {
    if (!wsId) return;
    if (this.CreateBoardForm.valid) {
      this.boardService.createBoard(String(this.CreateBoardForm.value.boardName), wsId).subscribe({
        next: (res) => {
          console.log(res);
          this.CreateBoardForm.reset();
          this.closeModal();
          this.refreshCurrentWorkspace();
        },
        error: (err) => {
          console.error(err);
        },
      });
    } else {
      this.CreateBoardForm.markAllAsTouched();
    }
  }

  // ┌── [INFO] ──────────────────────────────────────────────────────────────────┐
  // │      Remove Methods                                                        │
  // └────────────────────────────────────────────────────────────────────────────┘

  removeBoard(bId: number) {
    this.boardService.removeBoard(bId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  removeList(lId: number) {
    this.listService.removeList(lId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  removeTask(tId: number) {
    this.taskService.removeTask(tId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  deleteWorkspace() {
    if (this.DeleteWorkspaceForm.valid) {
      const enteredEmail = this.DeleteWorkspaceForm.value.confirmEmail;
      const userEmail = this.WholeData().user?.email;

      if (enteredEmail === userEmail) {
        this.workspaceService.removeWorkspace(this.currentWorkspaceId).subscribe({
          next: (res: any) => {
            console.log(res);
            this.closeModal();
            this.getWorkspace();
            this.clearWorkspaceData();
          },
          error: (err) => {
            console.error(err);
          },
        });
      } else {
        alert('Email confirmation does not match your account email.');
      }
    } else {
      this.DeleteWorkspaceForm.markAllAsTouched();
    }
  }

  removeWorkspace(wId: number) {
    this.workspaceService.removeWorkspace(wId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.refreshCurrentWorkspace();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
