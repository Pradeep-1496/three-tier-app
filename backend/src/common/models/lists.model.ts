import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { BoardModel } from './boards.model';
import { TaskModel } from './tasks.model';

@Table({
  tableName: 'lists',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class ListModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'list_id',
  })
  listId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'list_name',
  })
  listName!: string;

  @ForeignKey(() => BoardModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'board_id',
  })
  boardId!: number;

  @BelongsTo(() => BoardModel)
  board!: BoardModel;

  @HasMany(() => TaskModel)
  tasks!: TaskModel[];
}
