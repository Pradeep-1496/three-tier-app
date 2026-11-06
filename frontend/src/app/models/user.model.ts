interface UserResponse {
  userId: number;
  email: string;
}

interface WorkspaceUser extends UserResponse {
  role: 'Owner' | 'Member';
  createdAt: string;
}
