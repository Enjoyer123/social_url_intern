'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser,checkLoginStatus, checkUserExistsServer, loginUser } from '../../lib/api/auth';
import { useAuth } from '@/providers/MycontextProvider';
import liff from '@line/liff';
import { getUserData } from '@/lib/api/user';
import { LoginData } from '@/types/types';

const page = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiffReady, setIsLiffReady] = useState(false);
  const { checkLiffLogin,lineProfile,setUser} = useAuth(); // ใช้ context เพื่อจัดการสถานะผู้ใช้
  const router = useRouter();


   
      useEffect(() => {
        const checkAuth = async () => {
          
          const isLineLoggedIn = await checkLiffLogin();
          const serverLoginStatus = await checkLoginStatus();

         

          console.log('Line login, Server loginqwefwef:', isLineLoggedIn, serverLoginStatus.isLoggedIn);
          
          if (!isLineLoggedIn) {
            // ถ้า LINE ยังไม่ได้ล็อกอิน ให้ไปที่หน้าแรก
            console.log('User is not authenticated in our system, trying with LINEsdfsad');
            router.push('/');
            return;
          } else if (isLineLoggedIn && !serverLoginStatus.isLoggedIn) {
            // ถ้า LINE ล็อกอินแล้ว แต่เซิร์ฟเวอร์ยังไม่ได้ล็อกอิน ให้ไปหน้าลงทะเบียน
            console.log('------------------');
            // อาจจะต้องดึงข้อมูล LINE profile เพื่อส่งไปหน้าลงทะเบียน
        
            ///////////////

            try {
              // Get LINE profile information
              const profile = await liff.getProfile();
              const { userId, pictureUrl, displayName } = profile;
              console.log("LINE profile:", displayName);
              
              // Check if user exists in database
              const userExists = await checkUserExistsServer(userId);
              console.log("userExits",userExists.data?.exist)
              if (userExists.data?.exist) {
                console.log("logining")

                // If user exists, proceed with server login
                const detail = await loginUser(userId);
                console.log("login detqail",detail)
              
            
                  if (detail.success && detail.data) {
                    setUser(detail.data); // ✅ ไม่มี TypeScript error แน่นอน
                    setLoading(false) 
                    router.push('/home');
                  } else {
                    console.error('Login failed:', detail.error);
                  }
          
               
              } else {
                // If user doesn't exist, redirect to registration
                router.push(`/register?lineId=${userId}&pictureUrl=${encodeURIComponent(pictureUrl || '')}&displayName=${encodeURIComponent(displayName || '')}`);
              }
            } catch (error) {
              console.error('Error processing LINE authentication:', error);

              setTimeout(() => {
                
              }, 500);
              router.push('/');
            }


            ////////////////
           
          } else if (isLineLoggedIn && serverLoginStatus.isLoggedIn) {
            // ถ้าทั้ง LINE และเซิร์ฟเวอร์ล็อกอินแล้ว ให้ไปหน้าหลัก
            console.log('User is already authenticated', serverLoginStatus.user);
         
            setLoading(false);
            // setIsAuthenticated(true);
            router.push('/home');
            return;
          }
        };
        
        console.log('Started token ping');
        // เริ่มต้นการ ping ทุก 4 นาที

        checkAuth();

        
    }, [router]);
  // useEffect(() => {
  //   const checkAuth = async () => {

  //     const isLoggedIn = await checkLiffLogin();
  //     console.log('isLoggedIn: line button', isLoggedIn);
  //     if (!isLoggedIn) {
  //       console.log('/line User is not authenticated in our system, trying with LINE');
  //       router.push('/');
  //       return;
  //     } else {
  //       console.log('User is already authenticated in our system');
  //       router.push('/home');
  //       return;
  //     }
  //   }
  //   checkAuth();

  // },[]);


  // useEffect(() => {
  //   const initLiff = async () => {
  //     try {
  //       // Import LIFF dynamically
  //       const { default: liff } = await import('@line/liff');

  //       // Initialize LIFF
  //       await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
  //       setIsLiffReady(true);

  //       // Check if user is already logged in with LINE
  //       if (liff.isLoggedIn()) {
  //         handleAutoLogin();
  //       } else {
  //         console.log('User iasdsadsads logged in with LINE');


  //       }
  //     } catch (error) {
  //       console.error('LIFF initialization failed', error);
  //       setError('Failed to initialize LINE login');
  //     }
  //   };

  //   initLiff();
  // }, []);

  // const handleAutoLogin = async () => {
  //   try {
  //     setLoading(true);
  //     const { default: liff } = await import('@line/liff');

  //     const profile = await liff.getProfile();
  //     const { userId, pictureUrl, displayName } = profile;
  //     // Check if user exists in our database
  //     const { exists } = await checkUserExists(userId);
     
  //     if (exists) {
  //       // Login existing user
  //       await login(userId);
  //       router.push('/home');
  //     } else {
  //       // Redirect to registration with LINE data
  //       router.push(`/register?lineId=${userId}&pictureUrl=${encodeURIComponent(pictureUrl || '')}`);
  //     }
  //   } catch (error) {
  //     console.error('Auto login failed', error);
  //     setError('Failed to authenticate with LINE');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-white z-[9999]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">กำลังประมวลผลการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }
  




  return null;
}
export default page




