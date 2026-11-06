import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { Role } from 'src/common/enums/role-enum';

export class CreateWsMemberDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  wsId!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId!: number;

  @ApiProperty({ example: Role.MEMBER, enum: Role })
  @IsEnum(Role)
  role!: Role;
}
