export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    accessToken: string;
    refreshToken: string;
  };
}
