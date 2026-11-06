import { Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogModel } from 'src/common/models/activity_logs.model';

@Injectable()
export class ActivityLogsService {
  async create(createActivityLogDto: CreateActivityLogDto) {
    try {
      const newLog: any = {
        actionName: createActivityLogDto.actionName,
        type: createActivityLogDto.type,
        action: createActivityLogDto.action,
        actionBy: createActivityLogDto.actionBy,
      };

      return await ActivityLogModel.create(newLog);
    } catch (error) {
      throw error;
    }
  }

  async findAll(user: any) {
    try {
      return await ActivityLogModel.findAll({
        where: {
          actionBy: user.user_id,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
