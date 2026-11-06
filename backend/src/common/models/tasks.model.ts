import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { ListModel } from './lists.model';
import { TaskAssignmentModel } from './task_assignments.model';
import { CommentModel } from './comments.model';

@Table({
  tableName: 'tasks',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class TaskModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'task_id',
  })
  taskId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'task_name',
  })
  taskName!: string;

  @ForeignKey(() => ListModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'list_id',
  })
  listId!: number;

  @BelongsTo(() => ListModel)
  list!: ListModel;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    defaultValue: 'to-do',
    values: ['to-do', 'in-progress', 'completed'],
  })
  status!: string;

  @HasMany(() => TaskAssignmentModel)
  taskAssign!: TaskAssignmentModel[];

  @HasMany(() => CommentModel)
  comments!: CommentModel[];
}
