import { Request, Response, NextFunction } from 'express';
import { JsonPayload } from '../types/JsonPayload.js';
import jwt from "jsonwebtoken";

import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/jwt';
import prisma from '../utils/prisma';
import { User } from '../types/UserData';



export const getProtected = (req: Request, res: Response) => {

  if (req.user) {
    console.log(req.user);
    res.status(200).json({
      message: 'User authenticated successfully',
      user: req.user,
    });
  } else {
    res.status(401).json({
      message: 'Unauthorized',
    });
  }
};



// สร้าง token
const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.role_id },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id ,roleId: user.role_id},
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// ---------------------- LOGIN ----------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { lineId } = req.body;

    const user = await prisma.users.findUnique({
      where: { line_id: lineId },
    });

    if (!user) {
       res.status(404).json({ error: 'User not found' });
       console.log("User not found")
       return;
    }

    const { accessToken, refreshToken } = generateTokens(user as User);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 *15
        });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 *60 *24 * 7 , //1000 * 60 * 60 * 24 * 7
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_id,
        pictureUrl: user.picture_url,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};



// export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token) return res.status(401).json({ error: 'No refresh token' });

//     const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JsonPayload;
//     const userId = decoded.userId;

//     // เปลี่ยนจาก raw SQL ไปใช้ Prisma
//     const user = await prisma.users.findUnique({
//       where: {
//         id: userId
//       }
//     });
    
//     if (!user) return res.status(404).json({ error: 'User not found' });


//     const { accessToken } = generateTokens(user as User);

//      res.cookie('accessToken', accessToken, {
//       httpOnly: true,
//       secure: false,
//       sameSite: 'lax',
//       maxAge: 1000 * 60 * 15,
//     });

//      return res.json({ success: true });
//   } catch (err) {
//     console.error('Refresh token error:', err);
//     return  res.status(403).json({ error: 'Invalid or expired refresh token' });
//   }
// };


export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    console.log("Refresh token calling")
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ error: 'No refresh token dsfsdf' });
      console.log( "no refres auth sdfs")
      return;
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JsonPayload;
    const userId = decoded.userId;

    const user = await prisma.users.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { accessToken } = generateTokens(user as User);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 *15, // 5 นาที
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Refresh token error:', err);
    // ส่งต่อไปยัง error handler หรือจัดการในที่นี้
    res.status(500).json({ error: 'Invalid or expired refresh token' });
  }
};
// ฟังก์ชัน logout ไม่จำเป็นต้องเปลี่ยนเพราะไม่มีการเข้าถึงฐานข้อมูล

// ---------------------- LOGOUT ----------------------
export const logout = (req: Request, res: Response) => {
  console.log("Logout")
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

   res.json({ success: true, message: 'Logged out successfully' });
};


// // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
export const checkUser = async (req: Request, res: Response) => {
  try {
    console.log("Check user",req.body)
    const { lineId } = req.body;

    // ตรวจสอบผู้ใช้ในฐานข้อมูลด้วย Prisma
    const user = await prisma.users.findUnique({
      where: {
        line_id: lineId
      }
    });

    res.json({
      exists: user !== null,
      user: user || null
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
};



export const verifyToken = (req: Request, res: Response): void => {
  // ถ้าเข้าถึงฟังก์ชันนี้ได้ แสดงว่า middleware authenticate ทำงานสำเร็จแล้ว
  // จึงสามารถส่งข้อมูลผู้ใช้กลับไปได้เลย
  try{

    res.status(200).json({
      valid: true,
      user: req.user,
      isLoggedIn:true
      // สามารถเพิ่มข้อมูลอื่นๆ ที่ต้องการส่งกลับได้ที่นี่
    });
  }catch (error) {
    // กรณีเกิดข้อผิดพลาด ไม่ส่ง error กลับไป
    res.status(200).json({ isLoggedIn: false });
  }
};

export const checkLogin = (req: Request, res: Response): void => {
  // รับ token จาก cookie หรือ header
  let token: string = req.cookies.accessToken;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // ถ้าไม่มี token เลย ไม่ต้อง error แค่บอกว่าไม่ได้ล็อกอิน
  if (!token) {
    res.status(200).json({ isLoggedIn: false, user: null });
    return; // อย่าลืม return เพื่อจบการทำงานของฟังก์ชัน
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as Express.Request['user'];
    console.log("ข้อมูลที่ถอดรหัสได้", decoded);
    
    res.status(200).json({
      isLoggedIn: true,
      user: req.user,
    });
  } catch (error) {
    // กรณีเกิดข้อผิดพลาด ไม่ส่ง error กลับไป
    res.status(200).json({ isLoggedIn: false, user: null });
  }
}


// routes/auth.ts หรือ controller/auth.ts

export const ping = (req: Request, res: Response): void => {

  res.status(200).json({ success: true, message: 'pong' });

}

