import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from 'src/common/models/users.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    try {
      const users = await UserModel.findAll({
        attributes: ['userId', 'email'],
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findOne(wId: number, user: any) {
    try {
      const userMember = await WorkspaceMemberModel.findOne({
        where: {
          userId: user.user_id,
          workspaceId: wId,
        },
      });

      if (userMember?.dataValues.role !== 'Owner' && !userMember)
        throw new UnauthorizedException(
          'You not have access to this workspace',
        );

      const users = await WorkspaceMemberModel.findAll({
        where: {
          workspaceId: wId,
          // userId: {
          //   [Op.ne]: user.user_id,
          // },
        },
        order: [['userId', 'ASC']],
        include: [{ model: UserModel, attributes: ['userId', 'email'] }],
      });

      return users.map((u) => ({
        userId: u.dataValues.user.dataValues.userId,
        email: u.dataValues.user.dataValues.email,
        role: u.dataValues.role,
        createdAt: u.dataValues.created_at,
      }));
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
