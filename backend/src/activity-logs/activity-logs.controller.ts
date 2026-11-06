import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  // @Post()
  // create(
  //   @Body() createActivityLogDto: CreateActivityLogDto,
  // ) {
  //   return this.activityLogsService.create(createActivityLogDto);
  // }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.activityLogsService.findAll(user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.activityLogsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateActivityLogDto: UpdateActivityLogDto,
  // ) {
  //   return this.activityLogsService.update(+id, updateActivityLogDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.activityLogsService.remove(+id);
  // }
}
