import { Request, Response } from "express";

import prisma from '../utils/prisma';

//fetch all user data
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.roles.findMany();
    console.log("dsfsdf", users)
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};



//fetch user data with role & position name
export const getUsersWithRoleandPos = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        roles: {
          select: {
            name: true,
          },
        },
        positions: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });

  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    console.log("userIdไำไำ", userId)
    if (!userId) {
      res.status(401).json({ error: 'Unauthorizedwer' });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log("user", user);

    // ส่งคืน user ทั้งตัว
    res.json(user);
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};





export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {

    const newUser = await prisma.users.create({
      data: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        department: req.body.department,
        picture_url: req.body.picture_url,
        role_id: 1,
        position_id: 1,
        line_id: req.body.line_id,
        cardNumber: req.body.cardNumber
      }

    });

    console.log("newUser", newUser)
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};


export const test = async (req: Request, res: Response): Promise<void> => {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    res.status(401).json({ message: 'No access token' });
    return
  }

  const token = authorization.split(' ')[1]; // ดึง token จาก Bearer token

  // เช็คว่า token หมดอายุหรือไม่ (จำลองการหมดอายุ)
  if (token === 'expired_token') {
    res.status(401).json({ message: 'Access token expired' });
    return
  }

  // ถ้า token ยังไม่หมดอายุ
  res.status(200).json({ message: 'Access token valid' });
  return
}
