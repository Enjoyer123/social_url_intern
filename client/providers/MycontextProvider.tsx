'use client';

import { checkLoginStatus, checkUserExists, refreshToken } from '@/lib/api/auth';
import { getUser } from '@/lib/api/user';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData } from '@/types/types';
type MyContextType = {
  value: string;
  setValue: (val: string) => void;
  user: UserData | null;
  setUser: (user: UserData | null) => void;
};



const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState('initial value');
  const [user, setUser] = useState<UserData | null>(null);

  const router = useRouter();




useEffect(() => {
    const checkAuth = async () => {


      try {
        
        const { isLoggedIn, user } = await checkLoginStatus();
        if (isLoggedIn && user) {


          console.log('isLoggedIn:', isLoggedIn);
          console.log('user:', user);
          const UserData = await getUser(user.line_id);

          setUser(UserData);
          console.log('User data:', UserData);
        } else {
          await handleAutoLogin();
          console.log('User is not logged in, redirecting to login page...');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/');
      } 
    };

  
    checkAuth();
    
  }, [router]);

      const handleAutoLogin = async () => {
        try {
    
          const { default: liff } = await import('@line/liff');
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
    
          const profile = await liff.getProfile();
          const { userId, pictureUrl, displayName } = profile;
    
          // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
          try {
            const { exists } = await checkUserExists(userId);
            console.log('User exists:', exists);
    
            if (exists) {
              // พยายาม refresh token ก่อน
              const isRefreshed = await refreshToken();
    
              
    
              if (isRefreshed) {
                console.log('Token refreshed successfully');
                
                // สำคัญมาก: ดึงข้อมูลผู้ใช้ใหม่ทันทีหลังจาก refresh token สำเร็จ
                const userData = await getUser(userId);
                setUser(userData); // อัปเดต state ด้วยข้อมูลใหม่
                
                router.push('/home');
                return;
              }else {
                // ถ้า refresh ไม่ได้ จึงทำการล็อกอินใหม่
                console.log('Token refresh failed, logging in again');
                // await login(userId);
                router.push('/');
              }
            } else {
              // ผู้ใช้ไม่มีในระบบ ส่งไปลงทะเบียน
              router.push(`/register?lineId=${userId}&pictureUrl=${encodeURIComponent(pictureUrl || '')}`);
            }
          } catch (apiError) {
            console.error('API Error:', apiError);
    
            // หากเป็น error 401 หรืออื่นๆ ลองล็อกอินใหม่
            try {
              // await login(userId);
              router.push('/');
            } catch (loginError) {
              console.error('Login failed after API error:', loginError);
            }
          }
        } catch (error) {
          console.error('Auto login failed', error);
        }
      };

  return (
    <MyContext.Provider value={{ value, setValue, user, setUser }}>
      {children}
    </MyContext.Provider>
  );
};


export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be used inside MyContextProvider');
  return context;
};
