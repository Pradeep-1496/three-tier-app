import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { WorkspaceModel } from './workspaces.model';
import { ListModel } from './lists.model';

@Table({
  tableName: 'boards',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class BoardModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'board_id',
  })
  boardId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'board_name',
  })
  boardName!: string;

  @ForeignKey(() => WorkspaceModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'workspace_id',
  })
  workspaceId!: number;

  @BelongsTo(() => WorkspaceModel)
  workspace!: WorkspaceModel;

  @HasMany(() => ListModel)
  lists!: ListModel[];
}
