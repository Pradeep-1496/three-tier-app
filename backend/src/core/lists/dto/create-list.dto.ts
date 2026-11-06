import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
export class CreateListDto {
  @ApiProperty({ example: 'dev' })
  @IsString()
  listName!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  boardId!: number;
}
