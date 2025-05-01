"use client";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserData } from '../../types/types'; // ปรับให้ตรงกับ path ของไฟล์ types.ts
import { checkLoginStatus, logout, test, checkUserExists, refreshToken } from '../../lib/api/auth';
import { startTokenPing, stopTokenPing } from '@/utils/tokenRefresher';
import { getUser } from '../../lib/api/user';
import { toast } from 'sonner';
import { useMyContext } from '@/providers/MycontextProvider';
import { useContext } from 'react';


export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { value, setValue } = useMyContext();

  useEffect(() => {
    console.log('Started token ping');
    // เริ่มต้นการ ping ทุก 4 นาที
    startTokenPing();

    // Cleanup เมื่อ component ถูก unmount หรือ logout
    return () => {
      console.log('Stopped token ping');
    };
  }, []);
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
      } finally {
        setLoading(false);
      }
    };
   
    
    
    checkAuth();
    
  }, [router]);


  const handleAutoLogin = async () => {
    try {


      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    await logout();
    stopTokenPing();
    

    toast("Logout success", {
      description: "กำลังนำคุณไปยังหน้า login",
      duration: 3000,

  })
  setInterval(() => {
    router.push('/');
  }, 3000);
   
  };


  const handleTest = async () => {
    try {
      const response = await test();
      console.log('Test response:', response);
    } catch (error) {
      console.error('Error during test:', error);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <main className="flex min-h-screen flex-col items-center p-8">

      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Home</h1>

        {user && (
          <div className="flex flex-col items-center mb-6">
            {user.picture_url && (
              <img
                src={user.picture_url}
                alt={`${user.first_name}'s profile`}
                className="w-24 h-24 rounded-full mb-4 border-2 border-gray-200"
              />
            )}
            <h2 className="text-xl font-semibold">
              Welcome, {user.first_name} {user.last_name}
            </h2>
            <h1>{value}</h1>
          </div>
        )}

        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Logout
        </Button>


        <Button onClick={handleTest} >
          Test API
        </Button>
      </div>
    </main>
  );
}