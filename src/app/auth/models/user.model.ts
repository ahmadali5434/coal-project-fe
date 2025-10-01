export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
  }
  
  export interface AuthResponse {
    accessToken: string;
    user: User;
  }
  