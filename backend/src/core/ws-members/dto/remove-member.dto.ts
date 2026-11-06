import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RemoveMemberDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  wsId!: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId!: number;
}
