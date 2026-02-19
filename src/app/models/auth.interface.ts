import { User } from "./user.interface";

export interface RegisterRequest {

    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;


}

export interface AuthResponse{
    success: boolean;
     message?: string;
    data: {

        token:string;
        user: User;
expiresIn?: number;

    };
    error?: string


}

export interface LoginRequest{
    email:string;
    password:string;


}

export interface ResetPasswordRequest{
    token:string;
    password:string;
    confirmPassword:string


}

export interface ForgotPasswordRequest{

    email:string
}