import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListModel } from 'src/common/models/lists.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { UserModel } from 'src/common/models/users.model';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { BoardModel } from 'src/common/models/boards.model';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { Task } from './entities/task.entity';
import { LogAction } from 'src/common/enums/log-action';
import { TaskModel } from 'src/common/models/tasks.model';
import { TaskStatus } from 'src/common/enums/task-status';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskAssignmentModel } from 'src/common/models/task_assignments.model';
import { CommentModel } from 'src/common/models/comments.model';

@Injectable()
export class TasksService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async create(createTaskDto: CreateTaskDto, user: any) {
    try {
      const list: any = await ListModel.findByPk(createTaskDto.listId, {
        include: [
          {
            model: BoardModel,
            include: [
              {
                model: WorkspaceModel,
                include: [
                  {
                    model: WorkspaceMemberModel,
                    include: [
                      {
                        model: UserModel,
                        where: {
                          userId: user.user_id,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!list)
        throw new ConflictException('you dont have access to this list ');

      const taskExist = await TaskModel.findOne({
        where: {
          taskName: createTaskDto.taskName,
        },
      });

      if (taskExist)
        throw new ConflictException('Task with this name already exist');

      const newTask: any = {
        taskName: createTaskDto.taskName,
        listId: createTaskDto.listId,
      };
      if (createTaskDto.status) newTask.status = createTaskDto.status;

      const newLog: any = {
        actionName: createTaskDto.taskName,
        type: LogType.TASK,
        action: LogAction.CREATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await TaskModel.create(newTask);
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    try {
      const tasks: any = await TaskModel.findAll({
        include: [
          {
            model: ListModel,
            required: true,
            include: [
              {
                model: BoardModel,
                required: true,
                include: [
                  {
                    model: WorkspaceModel,
                    required: true,
                    include: [
                      {
                        model: WorkspaceMemberModel,
                        required: true,
                        where: {
                          userId: user.user_id,
                        },
                        attributes: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // ✅ Convert to plain JSON (no dataValues headache)
      const plainTasks = tasks.map((t: any) => t.get({ plain: true }));

      const result: any[] = [];

      plainTasks.forEach((task: any) => {
        const workspace = task.list.board.workspace;
        const board = task.list.board;
        const list = task.list;

        // 🔹 Workspace
        let ws = result.find((w) => w.workspaceId === workspace.workspaceId);
        if (!ws) {
          ws = {
            workspaceId: workspace.workspaceId,
            workspaceName: workspace.workspaceName,
            boards: [],
          };
          result.push(ws);
        }

        // 🔹 Board
        let bd = ws.boards.find((b) => b.boardId === board.boardId);
        if (!bd) {
          bd = {
            boardId: board.boardId,
            boardName: board.boardName,
            lists: [],
          };
          ws.boards.push(bd);
        }

        // 🔹 List
        let ls = bd.lists.find((l) => l.listId === list.listId);
        if (!ls) {
          ls = {
            listId: list.listId,
            listName: list.listName,
            tasks: [],
          };
          bd.lists.push(ls);
        }

        // 🔹 Task
        ls.tasks.push({
          taskId: task.taskId,
          taskName: task.taskName,
          status: task.status,
          createdAt: task.created_at,
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  //  task.dataValues.list.dataValues.board.dataValues.workspace.dataValues.workspaceId
  async AssignTask(assignTask: AssignTaskDto, user: any) {
    try {
      const task = await TaskModel.findByPk(assignTask.taskId, {
        include: [
          {
            model: ListModel,
            include: [
              {
                model: BoardModel,
                include: [
                  {
                    model: WorkspaceModel,
                    include: [
                      {
                        model: WorkspaceMemberModel,
                        include: [
                          {
                            model: UserModel,
                            where: {
                              userId: user.user_id,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!task) {
        throw new NotFoundException('Task not found or access denied');
      }

      const memberExist = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId:
            task.dataValues.list.dataValues.board.dataValues.workspace
              .dataValues.workspaceId,
          userId: assignTask.userId,
        },
      });

      if (!memberExist)
        throw new ConflictException(
          'User you assign to task is not a member of this workspace',
        );

      const userExist = await UserModel.findByPk(assignTask.userId);

      if (!userExist) throw new NotFoundException('User not found');

      const alreadyAssign = await TaskAssignmentModel.findOne({
        where: {
          taskId: assignTask.taskId,
        },
      });

      if (alreadyAssign) {
        const newLog: any = {
          actionName: 'update assign user: ' + assignTask.userId,
          type: LogType.TASK,
          action: LogAction.ASSIGN,
          actionBy: user.user_id,
        };

        const createLog = await this.activityLogsService.create(newLog);

        if (!createLog)
          throw new ConflictException('Log Not Created, Something went wrong');

        return await alreadyAssign.update({ userId: assignTask.userId });
      }

      const newLog: any = {
        actionName: 'user: ' + assignTask.userId,
        type: LogType.TASK,
        action: LogAction.ASSIGN,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await TaskAssignmentModel.create({
        taskId: assignTask.taskId,
        userId: assignTask.userId,
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, user: any) {
    try {
      const tasks = await TaskModel.findAll({
        include: [
          {
            model: ListModel,
            where: {
              listId: id,
            },
            include: [
              {
                model: BoardModel,
                include: [
                  {
                    model: WorkspaceModel,
                    include: [
                      {
                        model: WorkspaceMemberModel,
                        where: {
                          userId: user.user_id,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { model: TaskAssignmentModel },
          { model: CommentModel, include: [{ model: UserModel }] },
        ],
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: any) {
    try {
      const task = await TaskModel.findByPk(id, {
        include: [
          {
            model: ListModel,
            include: [
              {
                model: BoardModel,
                include: [
                  {
                    model: WorkspaceModel,
                    include: [
                      {
                        model: WorkspaceMemberModel,
                        where: {
                          userId: user.user_id,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (
        task?.dataValues.list.dataValues.board.dataValues.workspace.dataValues
          .workspaceMember[0].dataValues.role === null ||
        task === null
      )
        throw new UnauthorizedException(
          'you dont have access to update this task, only workspace member can update task',
        );

      const newLog: any = {
        actionName:
          id + ' : ' + task.dataValues.taskName + ' to ' + updateTaskDto.status,
        type: LogType.TASK,
        action: LogAction.UPDATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      const updatedTask = await task?.update({
        status: updateTaskDto.status,
      });

      return {
        taskId: updatedTask.dataValues.taskId,
        taskName: updatedTask.dataValues.taskName,
        status: updatedTask.dataValues.status,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, user: any) {
    const task = await TaskModel.findByPk(id, {
      include: [
        {
          model: ListModel,
          include: [
            {
              model: BoardModel,
              include: [
                {
                  model: WorkspaceModel,
                  include: [
                    {
                      model: WorkspaceMemberModel,
                      where: {
                        userId: user.user_id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (
      task?.dataValues.list.dataValues.board.dataValues.workspace.dataValues
        .workspaceMember[0].dataValues.role !== 'Owner'
    )
      throw new UnauthorizedException(
        'you dont have access to delete this task, only owner can remove task',
      );

    const newLog: any = {
      actionName: id + ' : ' + task.dataValues.taskName,
      type: LogType.TASK,
      action: LogAction.DELETE,
      actionBy: user.user_id,
    };

    const createLog = await this.activityLogsService.create(newLog);

    if (!createLog)
      throw new ConflictException('Log Not Created, Something went wrong');

    await task.destroy();

    return { message: 'Task delete successfully' };
  }
}
