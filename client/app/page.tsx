"use client";
import LineLoginButton from '@/components/auth/LineLoginButton';


export default function LandingPage() {
  // // Check if user is already logged in
  // const cookieStore = cookies();
  // const accessToken = cookieStore.get('accessToken');
  
  // if (accessToken) {
  //   redirect('/home');
  // }
 
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

