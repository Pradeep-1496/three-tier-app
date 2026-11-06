import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { WorkspaceMemberModel } from './workspace_members.model';
import { BoardModel } from './boards.model';

@Table({
  tableName: 'workspaces',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class WorkspaceModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'workspace_id',
  })
  declare workspaceId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'workspace_name',
  })
  declare workspaceName: string;

  @HasMany(() => WorkspaceMemberModel)
  workspaceMember!: WorkspaceMemberModel[];
  
  @HasMany(() => BoardModel)
  boards!: BoardModel[];
}
