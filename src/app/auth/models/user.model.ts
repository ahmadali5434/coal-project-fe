export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    role: 'user' | 'admin';
    accessToken: string;
    refreshToken: string;
  };
}
