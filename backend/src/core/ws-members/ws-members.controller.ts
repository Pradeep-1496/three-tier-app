import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WsMembersService } from './ws-members.service';
import { CreateWsMemberDto } from './dto/create-ws-member.dto';
import { UpdateWsMemberRoleDto } from './dto/update-ws-member.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RemoveMemberDto } from './dto/remove-member.dto';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('ws-members')
export class WsMembersController {
  constructor(private readonly wsMembersService: WsMembersService) {}

  @Post('/assign')
  assignMember(
    @Body() assignMember: CreateWsMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.wsMembersService.assignMember(user, assignMember);
  }

  @Patch('update')
  update(@Body() updateWsMemberDto: UpdateWsMemberRoleDto, @CurrentUser() user: any,) {
    return this.wsMembersService.update(updateWsMemberDto, user);
  }

  @Delete('remove')
  remove(@Body() removeMember: RemoveMemberDto, @CurrentUser() user: any) {
    return this.wsMembersService.remove(removeMember, user);
  }
}
