import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  taskId!: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  userId!: number;
}
