import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './core/workspaces/workspaces.module';
import { BoardsModule } from './core/boards/boards.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { ListsModule } from './core/lists/lists.module';
import { TasksModule } from './core/tasks/tasks.module';
import { CommentsModule } from './core/comments/comments.module';
import { UsersModule } from './core/users/users.module';
import { WsMembersModule } from './core/ws-members/ws-members.module';
import { AppController } from './app.controller';

@Module({
  imports: [DatabaseModule, AuthModule, WorkspacesModule, BoardsModule, ActivityLogsModule, ListsModule, TasksModule, CommentsModule, UsersModule, WsMembersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
