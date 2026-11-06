import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  taskId!: number;

  @ApiProperty({ example: 'comment of task' })
  @IsString()
  commentContent!: string;
}
