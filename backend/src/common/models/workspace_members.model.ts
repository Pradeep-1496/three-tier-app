import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserModel } from './users.model';
import { WorkspaceModel } from './workspaces.model';

@Table({
  tableName: 'workspace_members',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class WorkspaceMemberModel extends Model {
  @ForeignKey(() => WorkspaceModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'workspace_id',
  })
  declare workspaceId: number;

  @BelongsTo(() => WorkspaceModel)
  declare workspace: WorkspaceModel;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: number;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: ['Owner', 'Member'],
  })
  declare role: string;
}
