import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModel } from 'src/common/models/users.model';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(createUser: CreateUserDto) {
    try {
      const user = await UserModel.findOne({
        where: {
          email: createUser.email,
        },
      });

      if (user)
        throw new ConflictException('User already exist with same email');

      const hashPassword = await bcrypt.hash(createUser.password, 10);

      const newUser = {
        name: createUser.name,
        email: createUser.email,
        password: hashPassword,
      };

      await UserModel.create(newUser);

      return await this.login({
        email: createUser.email,
        password: createUser.password,
      });
    } catch (error) {
      throw error;
    }
  }

  async login(LoginUser: LoginUserDto) {
    try {
      if (!LoginUser.email || !LoginUser.password)
        throw new ConflictException('email and password not be the empty');

      const user = await UserModel.findOne({
        where: {
          email: LoginUser.email,
        },
      });

      if (!user) throw new NotFoundException('User Not Found with this email');

      const checkPass = await bcrypt.compare(
        LoginUser.password,
        user.dataValues.password,
      );

      if (!checkPass) throw new ConflictException('Incorrect Password');

      const payload = {
        user_id: user.dataValues.userId,
        email: user.dataValues.email,
      };

      const accessToken = await this.jwtService.sign(payload);

      return {
        user_id: user.dataValues.userId,
        email: user.dataValues.email,
        accessToken: accessToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
