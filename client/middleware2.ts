import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from './lib/api/axiosInstance';
import { refreshToken } from './lib/api/auth';
type JwtPayload = {
    roleId: number;
};

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('accessToken')?.value;

    try {
        if (!accessToken) {

           const  response = NextResponse.redirect(new URL('/kick', request.url));
            response.cookies.delete('accessToken'); // ลบ accessToken

            return response
        }

        const { roleId } = jwtDecode<JwtPayload>(accessToken);
        // ตัวอย่าง: หากต้องการให้เฉพาะผู้ดูแลระบบ (role_id = 2) เข้าถึงเส้นทางนี้ได้
        if (roleId !== 2) {
            return NextResponse.redirect(new URL('/kick', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error decoding token:', error);
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('accessToken');
        return response;
    }
}

// กำหนดเส้นทางที่ต้องการให้ Middleware ทำงาน
export const config = {
    matcher: ['/home/:path*'], // ตัวอย่าง: ตรวจสอบเฉพาะเส้นทางที่ขึ้นต้นด้วย /admin/
};
