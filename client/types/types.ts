import { AxiosRequestConfig } from 'axios';

export interface UserData {
    id: number;
    first_name: string;
    last_name: string;
    role_id: number;    
    position_id: number;
    line_id: string;
    email: string;
    phone: string;
    department: string;
    picture_url?: string;
    
  }
  
  export interface LoginResponse {
    success: boolean;
    user: UserData;
  }
  
  export interface CheckUserResponse {
    exists: boolean;
    user: UserData | null;
  }
  
  export interface AuthStatus {
    isLoggedIn: boolean;
    user: UserData | null;
  }
  
  export interface RegisterData {
    firstName: string;
    lastName: string;
    lineId: string;
    email: string;
    phone: string;
    department: string;
    pictureUrl?: string;
    cardNumber: string;
  }


export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
