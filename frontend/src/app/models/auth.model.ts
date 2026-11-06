interface LoginResponse {
  user_id: number;
  email: string;
  accessToken: string;
}

interface RegisterResponse extends LoginResponse {}
