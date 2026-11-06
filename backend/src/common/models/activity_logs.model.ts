import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserModel } from './users.model';

@Table({
  tableName: 'activity_logs',
  paranoid: false,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
})
export class ActivityLogModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'log_id',
  })
  logId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'action_name',
  })
  actionName!: string;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: [
      'workspaces',
      'boards',
      'workspace_members',
      'lists',
      'tasks',
      'task_assignments',
      'comments',
    ],
  })
  type!: string;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: ['create', 'update', 'delete', 'assign', 'add'],
  })
  action!: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'action_by',
  })
  actionBy!: number;

  @BelongsTo(() => UserModel)
  actionByUser!: UserModel;
}
