export interface User {
  id: string;
  username: string;
  email: string;
  role: string; // User, Admin
  token?: string;
  refreshToken?: string;
  tokenExpiration?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface AuthResponseData {
  token: string;
  refreshToken: string;
  expiration: Date;
  username: string;
  email: string;
  role: string;
}
