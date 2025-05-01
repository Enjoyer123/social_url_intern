"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, checkUserExists, refreshToken, checkLoginStatus ,test } from '@/lib/api/auth';
import { startTokenPing } from '@/utils/tokenRefresher';

export default function LineLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiffReady, setIsLiffReady] = useState(false);
  const router = useRouter();


  useEffect(() => {
  
    console.log('Initializing LIFF...');
    const initLiff = async () => {
      try {
        // Import LIFF dynamically
        const { default: liff } = await import('@line/liff');

        // Initialize LIFF
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        setIsLiffReady(true);

        // ตรวจสอบสถานะการล็อกอินของระบบเราก่อน
        try {
          console.log('try');

          const authStatus = await checkLoginStatus();
          console.log('Auth status:', authStatus);

          if (authStatus.isLoggedIn) {
            console.log('User is already authenticated in our system');
            router.push('/home');
            return;
          } 

        } catch (authError) {
          console.log('Not authenticated in our system, trying with LINE');
          // ถ้าไม่มี token หรือ token หมดอายุ จะเข้าสู่ขั้นตอนต่อไป
        }

        // ถ้ายังไม่ได้ล็อกอินในระบบเรา แต่ล็อกอินใน LINE อยู่แล้ว

        if (liff.isLoggedIn()) {
          
          console.log('LINE login exists but no system token. Logging out and re-login.');
          liff.logout();
          // handleAutoLogin();
        }

      

      } catch (error) {
        console.error('LIFF initialization failed', error);
        setError('Failed to initialize LINE login');
      }
    };

    initLiff();
  }, []);

  const handleAutoLogin = async () => {
    try {
      setLoading(true);
      const { default: liff } = await import('@line/liff');

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
            router.push('/home');
          } else {
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
          setError('Authentication failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auto login failed', error);
      setError('Failed to authenticate with LINE');
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const { default: liff } = await import('@line/liff');

      if (!liff.isLoggedIn()) {
        // Login with LINE
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      const { userId, pictureUrl } = profile;

      // Check if user exists in our database
      const { exists } = await checkUserExists(userId);

      if (exists) {
        // Login existing user
        await login(userId);
        router.push('/home');
      } else {
        // Redirect to registration with LINE data
        router.push(`/register?lineId=${userId}&pictureUrl=${encodeURIComponent(pictureUrl || '')}`);
      }
    } catch (error) {
      console.error('LINE login failed', error);
      setError('Failed to authenticate with LINE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading || !isLiffReady}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md flex items-center justify-center disabled:bg-gray-300"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.952 11.868c0-3.89-3.906-7.056-8.718-7.056-4.811 0-8.718 3.166-8.718 7.056 0 3.486 3.093 6.409 7.273 6.967 0.284 0.061 0.67 0.186 0.767 0.428 0.088 0.219 0.057 0.563 0.028 0.782 0 0-0.102 0.614-0.124 0.745-0.037 0.219-0.175 0.856 0.747 0.466 0.923-0.39 4.983-2.933 6.793-5.027v-0.001c1.254-1.375 1.952-2.767 1.952-4.36z" />
            </svg>
            Login with LINE
          </span>
        )}
      </button>
    </div>
  );
}