import { Request, Response } from "express";
import prisma from '../utils/prisma';
import { sendAuthError, sendSuccessResponse } from "../helper/sendError";

//get all user
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {

  try {

    const users = await prisma.users.findMany();

    sendSuccessResponse(res, {
      status: 200,
      message: 'Users fetched successfully',
      data: users
    });

  } catch (error) {

    sendAuthError(res, {
      status: 500,
      message: 'Failed to fetch roles',
      code: 'FETCH_USERS_ERROR'
    });
  }
};

// getme
export const getMe = async (req: Request, res: Response): Promise<void> => {

  try {

    const userId = (req.user as any)?.userId;

    if (!userId) {
      sendAuthError(res, {
        status: 401,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });

      return;
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      sendAuthError(res, {
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });

      return;
    }

    sendSuccessResponse(res, {
      status: 200,
      message: 'Users fetched successfully',
      data: user
    });

  } catch (err) {

    sendAuthError(res, {
      status: 500,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });

  }
};

// create profile
export const createProfile = async (req: Request, res: Response): Promise<void> => {

  try {

    const {
      first_name,
      last_name,
      email,
      phone,
      department,
      picture_url,
      line_id,
      cardNumber,
    } = req.body;

    if (!first_name || !last_name || !email || !line_id || !cardNumber) {
      sendAuthError(res, {
        status: 400,
        message: 'Missing required fields',
        code: 'VALIDATION_ERROR'
      });

      return;
    }

    const newUser = await prisma.users.create({
      data: {
        first_name,
        last_name,
        email,
        phone,
        department,
        picture_url,
        role_id: 1,
        position_id: 1,
        line_id,
        cardNumber,
      },
    });

    sendSuccessResponse(res, {
      status: 201,
      message: 'Users Created',
      data: newUser
    });

  } catch (error) {
    sendAuthError(res, {
      status: 500,
      message: 'Failed to create profile',
      code: 'CREATE_PROFILE_ERROR'
    });
  }

};


