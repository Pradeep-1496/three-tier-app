import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'xyz Feature' })
  @IsString()
  boardName!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  wsId!: number;
}
