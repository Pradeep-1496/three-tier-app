import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'new Fix in project' })
  @IsString()
  taskName!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  listId!: number;

  @ApiProperty({
    example: 'to-do',
    examples: ['to-do', 'in-progress', 'completed'],
  })
  @IsOptional()
  @IsString()
  status!: string;
}
