import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { UserModel } from 'src/common/models/users.model';
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { LogType } from 'src/common/enums/log-type';
import { LogAction } from 'src/common/enums/log-action';
import { Role } from 'src/common/enums/role-enum';
import { UpdateWsMemberRoleDto } from './dto/update-ws-member.dto';
import { CreateWsMemberDto } from './dto/create-ws-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { where } from 'sequelize';

@Injectable()
export class WsMembersService {
  constructor(private activityLogsService: ActivityLogsService) {}

  async assignMember(user: any, assignMember: CreateWsMemberDto) {
    try {
      const ws = await WorkspaceModel.findAll({
        include: [
          {
            model: WorkspaceMemberModel,
            where: {
              userId: user.user_id,
              role: 'Owner',
            },
          },
        ],
      });

      const names = ws.map((w) => w.dataValues.workspaceId);

      if (!names.includes(assignMember.wsId))
        throw new UnauthorizedException(
          'You are not authorized to assign members to this workspace',
        );

      const checkAlreadyAssign = await WorkspaceMemberModel.findAll({
        where: {
          workspaceId: assignMember.wsId,
          userId: assignMember.userId,
        },
      });

      if (checkAlreadyAssign.length !== 0)
        throw new ConflictException('User Already Assigned to this workspace');

      const checkUser = await UserModel.findOne({
        where: {
          user_id: assignMember.userId,
        },
      });

      if (!checkUser) throw new NotFoundException('User not found');

      const newLog: any = {
        actionName:
          'add member: ' +
          checkUser.dataValues.email +
          ' to ' +
          ws[0].dataValues.workspaceName,
        type: LogType.WORKSPACE,
        action: LogAction.ASSIGN,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      return await WorkspaceMemberModel.create({
        workspaceId: assignMember.wsId,
        userId: assignMember.userId,
        role: assignMember.role,
      });
    } catch (error) {
      throw error;
    }
  }

  async update(updateWsMemberRoleDto: UpdateWsMemberRoleDto, user: any) {
    try {
      if (updateWsMemberRoleDto.userId === user.user_id)
        throw new ConflictException(
          'Cant change self role, other owner can do',
        );

      const wsm = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: updateWsMemberRoleDto.wsId,
          userId: updateWsMemberRoleDto.userId,
        },
        include: [{ model: UserModel }, { model: WorkspaceModel }],
      });
      if (!wsm)
        throw new NotFoundException('User not assign to this workspace');

      const wso = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: updateWsMemberRoleDto.wsId,
          userId: user.user_id,
          role: Role.OWNER,
        },
      });

      if (wso?.dataValues.role !== Role.OWNER)
        throw new UnauthorizedException(
          'You dont have access to change, only owner can delete',
        );

      const newLog: any = {
        actionName:
          'update role: ' +
          wsm.dataValues.user.dataValues.email +
          ' to ' +
          updateWsMemberRoleDto.role +
          ' in ' +
          wsm.dataValues.workspace.dataValues.workspaceName,
        type: LogType.WORKSPACE_MEMBER,
        action: LogAction.UPDATE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      // return wso;
      return await wsm.update({
        role: updateWsMemberRoleDto.role,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(removeMember: RemoveMemberDto, user: any) {
    try {
      if (removeMember.userId === user.user_id)
        throw new ConflictException('Cant remove self, other owner can do');

      const wsm = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: removeMember.wsId,
          userId: removeMember.userId,
        },
        include: [{ model: UserModel }, { model: WorkspaceModel }],
      });
      if (!wsm)
        throw new NotFoundException('User not assign to this workspace');

      const wso = await WorkspaceMemberModel.findOne({
        where: {
          workspaceId: removeMember.wsId,
          userId: user.user_id,
          role: Role.OWNER,
        },
      });

      if (wso?.dataValues.role !== Role.OWNER)
        throw new UnauthorizedException(
          'You dont have access to remove, only owner can delete',
        );

      const newLog: any = {
        actionName:
          'remove member: ' +
          wsm.dataValues.user.dataValues.email +
          ' from ' +
          wsm.dataValues.workspace.dataValues.workspaceName,
        type: LogType.WORKSPACE_MEMBER,
        action: LogAction.DELETE,
        actionBy: user.user_id,
      };

      const createLog = await this.activityLogsService.create(newLog);

      if (!createLog)
        throw new ConflictException('Log Not Created, Something went wrong');

      await wsm.destroy();
      return { message: 'Member remove delete successfully' };
    } catch (error) {
      throw error;
    }
  }
}
