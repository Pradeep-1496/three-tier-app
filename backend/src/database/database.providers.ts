import { Sequelize } from 'sequelize-typescript';
import 'dotenv/config';
import { Dialect } from 'sequelize';
import { UserModel } from 'src/common/models/users.model';
import { WorkspaceModel } from 'src/common/models/workspaces.model';
import { WorkspaceMemberModel } from 'src/common/models/workspace_members.model';
import { BoardModel } from 'src/common/models/boards.model';
import { ListModel } from 'src/common/models/lists.model';
import { TaskModel } from 'src/common/models/tasks.model';
import { TaskAssignmentModel } from 'src/common/models/task_assignments.model';
import { CommentModel } from 'src/common/models/comments.model';
import { ActivityLogModel } from 'src/common/models/activity_logs.model';
export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'postgres',
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        models: [
          UserModel,
          WorkspaceModel,
          WorkspaceMemberModel,
          BoardModel,
          ListModel,
          TaskModel,
          TaskAssignmentModel,
          CommentModel,
          ActivityLogModel,
        ],
      });
      await sequelize.sync({ alter: true });
      return sequelize;
    },
  },
];
