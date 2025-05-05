'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserData } from '../../types/types'; 
import { checkLoginStatus, checkUserExistsServer, refreshToken } from '../../lib/api/auth';
import { startTokenPing, stopTokenPing } from '@/utils/tokenRefresher';
import { getUserData } from '../../lib/api/user';
import { toast } from 'sonner';
import { useContext } from 'react';
import { useAuth } from '@/providers/MycontextProvider';
import liff from '@line/liff';
import { Suspense } from 'react'


export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const router = useRouter();
  const { checkLiffLogin, lineProfile } = useAuth(); // ใช้ context เพื่อจัดการสถานะผู้ใช้
  const [isLoading, setIsLoading] = useState(true); // สถานะการโหลด
 
  
  useEffect(() => {
    console.log('Started token ping1');
    startTokenPing();
   

    return () => {
      console.log('Stopped token ping');
      stopTokenPing();
    };
  }, []);





  return (

    <>
    
     home
 
   
    
    </>




  );
}