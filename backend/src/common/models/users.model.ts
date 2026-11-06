import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { WorkspaceModel } from './workspaces.model';
import { WorkspaceMemberModel } from './workspace_members.model';
import { TaskAssignmentModel } from './task_assignments.model';
import { ActivityLogModel } from './activity_logs.model';

@Table({
  tableName: 'users',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class UserModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_id',
  })
  declare userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @HasMany(() => WorkspaceMemberModel)
  workspaceMember!: WorkspaceMemberModel[];

  @HasMany(() => TaskAssignmentModel)
  taskAssign!: TaskAssignmentModel[];

  @HasMany(() => ActivityLogModel)
  logs!: ActivityLogModel[];
}
