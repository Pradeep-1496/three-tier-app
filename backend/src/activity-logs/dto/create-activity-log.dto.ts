import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  actionName!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  action!: string;

  @ApiProperty()
  @IsNumber()
  actionBy!: number;
}
