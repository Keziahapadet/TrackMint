export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  fullName: string;
  email: string;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest{
    token:string;
    password:string;
    confirmPassword:string


}

export interface ForgotPasswordRequest{
    email:string
}