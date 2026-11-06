import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { BoardModel } from 'src/common/models/boards.model';
import { ListModel } from 'src/common/models/lists.model';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { LogAction } from 'src/common/enums/log-action';
import { UserModel } from 'src/common/models/users.model';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Injectable()
export class ListsService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async create(createListDto: CreateListDto, user: any) {
    try {
      const ws: any = await BoardModel.findByPk(createListDto.boardId);

      if (!ws) throw new NotFoundException('No workspace found by this board');

      const checkUserAssign = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: ws.dataValues.workspaceId,
          userId: user.user_id,
        },
      });

      if (!checkUserAssign)
        throw new ConflictException(
          'You are not Assigned to this workspace, so cant create list',
        );

      const checkListExist = await ListModel.findOne({
        where: {
          listName: createListDto.listName,
        },
      });

      if (checkListExist)
        throw new ConflictException('list with this name is already exist');

      const newList: any = {
        listName: createListDto.listName,
        boardId: createListDto.boardId,
      };

      const newLog: any = {
        actionName: createListDto.listName,
        type: LogType.LIST,
        action: LogAction.CREATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await ListModel.create(newList);
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    try {
      const lists = await BoardModel.findAll({
        include: [
          {
            model: ListModel,
          },
          {
            model: WorkspaceModel,
            include: [
              {
                model: WorkspaceMemberModel,
                where: {
                  userId: user.user_id,
                },
                attributes: [],
              },
            ],
            attributes: [],
          },
        ],
      });

      return lists;
    } catch (error) {
      throw error;
    }
  }

  async findByBoardId(id: number, user: any) {
    const lists = await ListModel.findAll({
      include: [
        {
          model: BoardModel,
          where: {
            boardId: id,
          },
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
    });

    return lists;
  }

  update(id: number, updateListDto: UpdateListDto) {
    return `This action updates a #${id} list`;
  }

  async remove(id: number, user: any) {
    try {
      const list = await ListModel.findByPk(id, {
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
      });

      if (
        list?.dataValues.board.dataValues.workspace.dataValues
          .workspaceMember[0].dataValues.role !== 'Owner'
      )
        throw new UnauthorizedException(
          'you dont have access to delete this board, only owner can remove board',
        );

      const newLog: any = {
        actionName: id + ' : ' + list.dataValues.listName,
        type: LogType.LIST,
        action: LogAction.DELETE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await list.destroy();
    } catch (error) {
      throw error;
    }
  }
}

// id + ' : ' + list.dataValues.listName
