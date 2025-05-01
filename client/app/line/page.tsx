'use client'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, login, checkUserExists } from '../../lib/api/auth';

const page = () => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiffReady, setIsLiffReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('useEffect called');
    const initLiff = async () => {
      try {
        // Import LIFF dynamically
        const { default: liff } = await import('@line/liff');

        // Initialize LIFF
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        setIsLiffReady(true);

        // Check if user is already logged in with LINE
        if (liff.isLoggedIn()) {
          console.log('User is logged in with LINE');
          handleAutoLogin();
        } else {
          console.log('User iasdsadsads logged in with LINE');


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
      console.log('handleAutoLogin called');
      setLoading(true);
      const { default: liff } = await import('@line/liff');

      const profile = await liff.getProfile();
      console.log('Profile:', profile);
      const { userId, pictureUrl, displayName } = profile;
      console.log('test1');
      // Check if user exists in our database
      const { exists } = await checkUserExists(userId);
      console.log('User exists:', exists);
      console.log('test');
      if (exists) {
        // Login existing user
        await login(userId);
        router.push('/home');
      } else {
        // Redirect to registration with LINE data
        router.push(`/register?lineId=${userId}&pictureUrl=${encodeURIComponent(pictureUrl || '')}`);
      }
    } catch (error) {
      console.error('Auto login failed', error);
      setError('Failed to authenticate with LINE');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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




