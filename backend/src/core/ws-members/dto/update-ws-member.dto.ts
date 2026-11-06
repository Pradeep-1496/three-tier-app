import { PartialType } from '@nestjs/swagger';
import { CreateWsMemberDto } from './create-ws-member.dto';

export class UpdateWsMemberRoleDto extends PartialType(CreateWsMemberDto) {}
