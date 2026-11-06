import { Module } from '@nestjs/common';
import { WsMembersService } from './ws-members.service';
import { WsMembersController } from './ws-members.controller';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';

@Module({
  imports: [ActivityLogsModule],

  controllers: [WsMembersController],
  providers: [WsMembersService],
})
export class WsMembersModule {}
