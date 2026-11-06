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
  tableName: 'comments',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class CommentModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'comment_id',
  })
  commentId!: number;

  @ForeignKey(() => TaskModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'task_id',
  })
  taskId!: number;

  @BelongsTo(() => TaskModel)
  task!: TaskModel;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'comment_content',
  })
  commentContent!: string;

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
