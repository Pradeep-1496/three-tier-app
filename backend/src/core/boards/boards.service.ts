import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardModel } from 'src/common/models/boards.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { LogAction } from 'src/common/enums/log-action';
import { UserModel } from 'src/common/models/users.model';
import { WorkspaceModel } from 'src/common/models/workspaces.model';

@Injectable()
export class BoardsService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async create(createBoardDto: CreateBoardDto, user: any) {
    try {
      const checkUserAssign = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: createBoardDto.wsId,
          userId: user.user_id,
        },
      });

      if (!checkUserAssign)
        throw new ConflictException(
          'User are no Assigned to this workspace, so cant create board',
        );

      const existBoard = await BoardModel.findOne({
        where: {
          boardName: createBoardDto.boardName,
        },
      });

      if (existBoard)
        throw new ConflictException('Board with this name is already exist');

      const newBoard: any = {
        boardName: createBoardDto.boardName,
        workspaceId: createBoardDto.wsId,
      };

      const newLog: any = {
        actionName: createBoardDto.boardName,
        type: LogType.BOARD,
        action: LogAction.CREATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await BoardModel.create(newBoard);
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    try {
      const boards: any = await UserModel.findAll({
        where: {
          userId: user.user_id,
        },

        include: [
          {
            model: WorkspaceMemberModel,
            include: [
              { model: WorkspaceModel, include: [{ model: BoardModel }] },
            ],
          },
        ],
      });

      // const workspacesWithBoards = boards.map((wm) => ({
      //   workspaceName: wm.workspaceMember.workspace?.workspaceName,
      //   boards: wm.workspaceMember.workspace?.boards?.map((b) => b.boardName),
      // }));

      return boards;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, user: any) {
    try {
      const boards: any = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: id,
          userId: user.user_id,
        },
        include: [{ model: WorkspaceModel, include: [{ model: BoardModel }] }],
      });

      if (!boards)
        throw new UnauthorizedException(
          'You dont have access to this workspace',
        );

      return boards.dataValues.workspace.dataValues.boards;
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  async remove(id: number, user: any) {
    try {
      const board = await BoardModel.findByPk(id, {
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
      });

      if (
        board?.dataValues.workspace.dataValues.workspaceMember[0].dataValues
          .role !== 'Owner'
      )
        throw new UnauthorizedException(
          'you dont have access to delete this board, only owner can remove board',
        );

      const newLog: any = {
        actionName: id + ' : ' + board.dataValues.boardName,
        type: LogType.BOARD,
        action: LogAction.DELETE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await board.destroy();
    } catch (error) {
      throw error;
    }
  }
}
