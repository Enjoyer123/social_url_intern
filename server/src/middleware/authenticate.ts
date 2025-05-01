import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '../config/jwt';
import '../types/express'; // let TS know req.user

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string = req.cookies.accessToken;
  let refreshToken: string = req.cookies.refreshToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token || !refreshToken) {
    res.status(401).json({ error: 'ไม่มีโทเค็นการเข้าถึง' });
    console.log("ไม่มีโทเค็นการเข้าถึงmiddle");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as Express.Request['user'];
    next();
  } catch (error) {
    res.status(401).json({ error: 'โทเค็นไม่ถูกต้องหรือหมดอายุ' });
    return;
  }
};

export default authenticate;

