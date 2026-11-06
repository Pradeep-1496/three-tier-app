import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'to-do',
    examples: ['to-do', 'in-progress', 'completed'],
  })
  @IsString()
  status!: string;
}
