import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from '../config/jwt';
import '../types/Express';
import { sendAuthError } from '../helper/sendError';

const authenticate = (req: Request, res: Response, next: NextFunction): void => {

  try {

    let accessToken: string = req.cookies?.accessToken;
    let refreshToken: string = req.cookies?.refreshToken;

    if (!accessToken && req.headers.authorization?.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
      sendAuthError(res, {
        status: 401,
        message: 'Access token is missing',
        code: 'ACCESS_TOKEN_MISSING'
      });
      return;
    }

    if (!refreshToken) {
      sendAuthError(res, {
        status: 401,
        message: 'Refresh token is missing',
        code: 'REFRESH_TOKEN_MISSING'
      });
      return;
    }

    const decoded = jwt.verify(accessToken, JWT_CONFIG.ACCESS_SECRET);
    req.user = decoded as Express.Request['user'];
    next();

  } catch (error) {

    sendAuthError(res, {
      status: 401,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });

  }
};

export default authenticate;

