import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TaskModel } from 'src/common/models/tasks.model';
import { ListModel } from 'src/common/models/lists.model';
import { BoardModel } from 'src/common/models/boards.model';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { CommentModel } from 'src/common/models/comments.model';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { LogAction } from 'src/common/enums/log-action';

@Injectable()
export class CommentsService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async create(createCommentDto: CreateCommentDto, user: any) {
    try {
      const task = await TaskModel.findByPk(createCommentDto.taskId, {
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

      const newComment = await CommentModel.create({
        taskId: createCommentDto.taskId,
        commentContent: createCommentDto.commentContent,
        userId: user.user_id,
      });

      const newLog: any = {
        actionName:
          newComment.dataValues.commentId +
          ' : ' +
          createCommentDto.commentContent,
        type: LogType.COMMENT,
        action: LogAction.CREATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return newComment;
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    try {
      return await TaskModel.findAll({
        include: [
          {
            model: CommentModel,
            where: {
              userId: user.user_id,
            },
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
