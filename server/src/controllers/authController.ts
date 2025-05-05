import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { sendAuthError, sendSuccessResponse } from '../helper/sendError';
import { JWT_CONFIG } from '../config/jwt';
import prisma from '../utils/prisma';
import { User, JsonPayload, UserResponseData, UserWithLoginStatus } from '../types/user';

// generate token
const generateTokens = (user: User) => {

  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.role_id },
    JWT_CONFIG.ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      roleId: user.role_id
    },
    JWT_CONFIG.REFRESH_SECRET,
    {
      expiresIn: '7d'
    }

  );

  return {
    accessToken,
    refreshToken
  };

};

// login
export const login = async (req: Request, res: Response): Promise<void> => {

  try {
    const { lineId } = req.body;

    if (!lineId) {
      sendAuthError(res, {
        status: 400,
        message: 'LINE ID is required',
        code: 'LINE_ID_REQUIRED'
      });

      return;
    }

    const user = await prisma.users.findUnique({
      where: { line_id: lineId },
    });

    if (!user) {

      sendAuthError(res, {
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });

      return;
    }

    const { accessToken, refreshToken } = generateTokens(user as User);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_HTTP === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_HTTP === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, //1000 * 60 * 60 * 24 * 7
    });

    sendSuccessResponse<UserResponseData>(res, {
      status: 200,
      message: "Login successful",
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_id,
        pictureUrl: user.picture_url,
      }
    });

  } catch (err) {

    sendAuthError(res, {
      status: 500,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });

    return;
  }
};

// refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      sendAuthError(res, {
        status: 401,
        message: 'No refresh token provided',
        code: 'NO_REFRESH_TOKEN'
      });

      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_CONFIG.REFRESH_SECRET) as JsonPayload;
    const userId = decoded.userId;

    const user = await prisma.users.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      sendAuthError(res, {
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });

      return;
    }

    const { accessToken } = generateTokens(user as User);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15,
    });

    sendSuccessResponse(res, {
      status: 200,
      message: 'refreshToken successfully',
    });


  } catch (err) {

    sendAuthError(res, {
      status: 500,
      message: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

// logout
export const logout = (req: Request, res: Response) => {

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  sendSuccessResponse(res, {
    status: 200,
    message: 'Logged out successfully',
  });

};

// chekUser
export const checkUser = async (req: Request, res: Response): Promise<void> => {

  try {

    const { lineId } = req.body;

    if (!lineId) {
      sendAuthError(res, {
        status: 400,
        message: 'LINE ID is required',
        code: 'LINE_ID_REQUIRED'
      });

      return;
    }

    const user = await prisma.users.findUnique({
      where: { line_id: lineId },
    });

    sendSuccessResponse(res, {
      status: 200,
      message: "User founded",
      data: {
        exist: !!user
      }
    });

    return;

  } catch (error) {

    sendAuthError(res, {
      status: 500,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });

    return;
  }
}

// check status
export const checkStatus = async (req: Request, res: Response): Promise<void> => {

  try {

    if (!req.user?.userId) {
      res.json({ isLoggedIn: false });
      return
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.json({ isLoggedIn: false });
      return
    }

    sendSuccessResponse<UserWithLoginStatus>(res, {
      status: 200,
      message: 'User logged in successfully',
      data: {
        isLoggedIn: true,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role_id,
          pictureUrl: user.picture_url
        }
      }
    });

    return;

  } catch (error) {

    sendAuthError(res, {
      status: 500,
      message: 'Internal server error',
      code: 'SERVER_ERROR',
      errorData: {
        isLoggedIn: false
      }
    });

    return
  }
}

// ping
export const ping = (req: Request, res: Response): void => {

  try {

    sendSuccessResponse(res, {
      status: 200,
      message: "pong"
    })

  } catch (error) {

    sendAuthError(res, {
      status: 500,
      message: 'Internal server error',
      code: 'SERVER_ERROR',

    });
  }
};


