import { JwtPayload } from 'jsonwebtoken';
export interface UserPayload extends JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}
