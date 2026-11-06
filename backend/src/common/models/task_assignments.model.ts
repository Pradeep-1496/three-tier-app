import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserModel } from './users.model';
import { TaskModel } from './tasks.model';

@Table({
  tableName: 'task_assignments',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class TaskAssignmentModel extends Model {
  @ForeignKey(() => TaskModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
    field: 'task_id',
  })
  taskId!: number;

  @BelongsTo(() => TaskModel)
  task!: TaskModel;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}
