import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { UserModel } from 'src/common/models/users.model';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { LogAction } from 'src/common/enums/log-action';
import { Role } from 'src/common/enums/role-enum';
import { BoardModel } from 'src/common/models/boards.model';
import { ListModel } from 'src/common/models/lists.model';
import { TaskModel } from 'src/common/models/tasks.model';
import { CommentModel } from 'src/common/models/comments.model';
import { TaskAssignmentModel } from 'src/common/models/task_assignments.model';

@Injectable()
export class WorkspacesService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: any) {
    try {
      const Workspace = await WorkspaceModel.findOne({
        where: { workspaceName: createWorkspaceDto.name },
      });

      if (Workspace)
        throw new ConflictException(
          'Workspace Name is already in taken, use another workspace name ',
        );

      const newLog: any = {
        actionName: createWorkspaceDto.name,
        type: LogType.WORKSPACE,
        action: LogAction.CREATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      const newWorkSpace = await WorkspaceModel.create({
        workspaceName: createWorkspaceDto.name,
      });

      const assignOwner: any = {
        workspaceId: newWorkSpace.dataValues.workspaceId,
        userId: user.user_id,
        role: Role.OWNER,
      };

      const newLogAssign: any = {
        actionName: 'Assign Owner',
        type: LogType.WORKSPACE,
        action: LogAction.ASSIGN,
        actionBy: user.user_id,
      };

      const createLogAss = await this.activityLogsService.create(newLogAssign);

      if (!createLogAss)
        throw new ConflictException('Log Not Created, Something went wrong');

      const assigned = await WorkspaceMemberModel.create(assignOwner);

      return { assignOwner, assigned };
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    const ws: any = await WorkspaceMemberModel.findAll({
      where: {
        userId: user.user_id,
      },
      include: [{ model: WorkspaceModel }],
    });

    return ws
      .filter((item) => item.workspace !== null)
      .map((item) => ({
        workspaceId: item.workspace.workspaceId,
        workspaceName: item.workspace.workspaceName,
        role: item.role,
      }));
  }

  async findOne(id: number, user: any) {
    try {
      const wholeWorksapce = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: id,
          userId: user.user_id,
        },
        include: [
          { model: UserModel },
          {
            model: WorkspaceModel,
            include: [
              {
                model: BoardModel,
                include: [
                  {
                    model: ListModel,
                    include: [
                      {
                        model: TaskModel,
                        include: [
                          {
                            model: CommentModel,
                            separate: true,
                            order: [['commentId', 'DESC']],
                            include: [{ model: UserModel }],
                          },
                          {
                            model: TaskAssignmentModel,
                            include: [{ model: UserModel }],
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

      return wholeWorksapce;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  async remove(id: number, user: any) {
    try {
      const ws = await WorkspaceModel.findByPk(id, {
        include: [
          {
            model: WorkspaceMemberModel,
            where: {
              userId: user.user_id,
            },
          },
        ],
      });

      if (ws?.dataValues.workspaceMember[0].dataValues.role !== 'Owner')
        throw new UnauthorizedException(
          'you dont have access to delete this Workspacce, only owner can remove Workspacce',
        );

      const newLog: any = {
        actionName: id + ' : ' + ws?.dataValues.workspaceName,
        type: LogType.WORKSPACE,
        action: LogAction.DELETE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      await ws.destroy();

      return { message: 'Workspacce delete successfully' };
    } catch (error) {
      throw error;
    }
  }
}
