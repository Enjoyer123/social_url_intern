"use client";
import LineLoginButton from '@/components/auth/LineLoginButton';
import { useAuth } from '@/providers/MycontextProvider';
import liff from '@line/liff';
import { useEffect } from 'react';


export default function LandingPage() {
 const {getUser} = useAuth()
    
 useEffect(()=>{
  console.log('oage.tsx')

//  const initLiff = async () => {
//        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
//        if (liff.isLoggedIn()) {
//          const profile = await liff.getProfile();
//         console.log('oage.tsx')
//          if(!profile.userId){
//             const test =  await getUser(profile.userId)
//             console.log('User profile:', userServer,test);
//          }
        
//          // ทำการจัดการข้อมูลผู้ใช้ที่นี่ เช่น บันทึกลง state หรือ context
//          // setLineProfile(profile); // ถ้าคุณมี state สำหรับเก็บข้อมูลผู้ใช้
 
 
//        }
//      }
 
//      initLiff();
   }, []);
 
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome</h1>
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login to continue</h2>
        <LineLoginButton />
      </div>
    </main>
  );
}

