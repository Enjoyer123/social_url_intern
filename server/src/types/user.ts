import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface User {
    id: number;
    role_id: number;
    first_name: string;
    last_name: string;
    email: string;
    picture_url: string;
    line_id: string;
}


export interface JsonPayload {
    userId: number;
    roleId?: number;
}


export interface UserResponseData {
    id: number;
    firstName: string;
    lastName: string;
    role: number | null;
    pictureUrl: string | null;
  }
  

 export interface UserWithLoginStatus {
    isLoggedIn: boolean;
    user: UserResponseData;
  }