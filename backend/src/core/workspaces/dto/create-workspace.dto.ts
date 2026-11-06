import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Development' })
  @IsString()
  name!: string;
}
