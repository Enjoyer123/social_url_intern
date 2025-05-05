"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, checkLoginStatus, loginUser } from '../../lib/api/auth';
import { count } from 'console';
import { useAuth } from '@/providers/MycontextProvider';
import liff from '@line/liff';
export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lineId = searchParams.get('lineId');
    const pictureUrl = searchParams.get('pictureUrl');
    const { checkLiffLogin ,setUser} = useAuth(); // ใช้ context เพื่อจัดการสถานะผู้ใช้
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        pictureUrl: pictureUrl || '',
        lineId: lineId || '',
        phone: '',
        email: '',
        department: '',
        cardNumber: '', // เพิ่มฟิลด์สำหรับหมายเลขบัตร
        eyeColor:''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCardNumberVerified, setIsCardNumberVerified] = useState(false);
    const [isLiffReady, setIsLiffReady] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    // useEffect(() => {
    //     if (!lineId) {
    //         router.push('/');
    //     }
    // }, [lineId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // เมื่อมีการเปลี่ยนแปลงหมายเลขบัตร ให้รีเซ็ตสถานะการตรวจสอบ
        if (name === 'cardNumber') {
            setIsCardNumberVerified(false);
        }
    };

    // ฟังก์ชันดึงข้อมูลจาก API ภายนอกตามหมายเลขบัตร
    const fetchUserDataByCardNumber = async () => {
        if (!formData.cardNumber) {
            setError('กรุณากรอกหมายเลขบัตร');
            return;
        }

        try {
            setFetchingData(true);
            setError('');
            
            // สมมติว่านี่คือ API ที่ดึงข้อมูลตามหมายเลขบัตร
            // เปลี่ยน URL และการจัดการ response ตาม API จริงที่คุณใช้
            const response = await fetch(`https://dummyjson.com/users/${formData.cardNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // เพิ่ม headers อื่นๆ ตามที่ API ต้องการ เช่น Authorization
                },
            });

            if (!response.ok) {
                throw new Error('ไม่พบข้อมูลหมายเลขบัตรนี้');
            }

            const userData = await response.json();
            
            // อัพเดตข้อมูลในฟอร์มจากข้อมูลที่ได้รับ
            setFormData(prev => ({
                ...prev,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                department: userData.eyeColor || '',
                cardNumber: formData.cardNumber, // เก็บหมายเลขบัตรที่กรอกไว้
                // อัพเดตฟิลด์อื่นๆ ตามที่ API ส่งกลับมา
            }));
            
            setIsCardNumberVerified(true);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setError(error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
            setIsCardNumberVerified(false);
        } finally {
            setFetchingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('Form data:', formData);
        e.preventDefault();
        
        if (!isCardNumberVerified) {
            setError('กรุณาตรวจสอบหมายเลขบัตรก่อนลงทะเบียน');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            // Register user
            await registerUser(formData);

            // Login after registration
        
            const detail = await loginUser(lineId!);
            console.log("login detqail",detail)
          
            console.log("login detqail2",detail.success,detail.data)

              if (detail.success && detail.data) {
                setUser(detail.data); // ✅ ไม่มี TypeScript error แน่นอน
                router.push('/home');
              } else {
                console.error('Login failed:', detail.error);
              }
            // Redirect to home page
            router.push('/home');
        } catch (err) {
            setError('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };
    const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  const checkAuth = async () => {
    const [isLineLoggedIn, serverLoginStatus] = await Promise.all([
      checkLiffLogin(),
      checkLoginStatus(),
    ]);

    console.log('Line login, Server login:', isLineLoggedIn, serverLoginStatus.isLoggedIn);

    if (isLineLoggedIn && serverLoginStatus.isLoggedIn) {
        console.log("/home")
      router.push('/home');
    } else if (!isLineLoggedIn) {
        console.log("/")
      router.push('/');
    }

    setAuthChecked(true); // ป้องกันการเช็คซ้ำ
  };

  if (!authChecked) {
    checkAuth();
  }
}, [router, authChecked]);

    // useEffect(() => {
            
              
    //             const checkAuth = async () => {
    //                 const isLineLoggedIn = await checkLiffLogin();
    //                 const serverLoginStatus = await checkLoginStatus();
                    
    //                 console.log('Line login, Server login:', isLineLoggedIn, serverLoginStatus.isLoggedIn);
                    
    //                 if (!isLineLoggedIn) {
    //                   // If user is not logged in with LINE, redirect to the home page
    //                   console.log('User is not authenticated with LINE, trying with LINE');
    //                   router.push('/');
    //                   return;
    //                 }
                    
    //                 // If user is already logged in with LINE, redirect to home page instead of root
    //                 else if (isLineLoggedIn && serverLoginStatus.isLoggedIn) {
    //                   console.log('User is already authenticated, redirecting to home page');
    //                   router.push('/home');
    //                   return;
    //                 }
            
    //               };
    //               checkAuth();
    //             }
          
    //     , [router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">ลงทะเบียนผู้ใช้</h1>

                {pictureUrl && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={pictureUrl}
                            alt="Profile Picture"
                            className="w-24 h-24 rounded-full border-2 border-gray-200"
                        />
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ส่วนกรอกหมายเลขบัตรและปุ่มตรวจสอบ */}
                    <div className="mb-6">
                        <label htmlFor="cardNumber" className="block text-gray-700 font-medium mb-2">
                            หมายเลขบัตร
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                required
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="กรอกหมายเลขบัตรของคุณ"
                            />
                            <button
                                type="button"
                                onClick={fetchUserDataByCardNumber}
                                disabled={fetchingData || !formData.cardNumber}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                {fetchingData ? 'กำลังค้นหา...' : 'ตรวจสอบ'}
                            </button>
                        </div>
                        {isCardNumberVerified && (
                            <p className="text-green-600 text-sm mt-1">✓ พบข้อมูลบัตรแล้ว</p>
                        )}
                    </div>

                    {/* แสดงฟอร์มเต็มหลังจากตรวจสอบหมายเลขบัตรแล้ว */}
                    {isCardNumberVerified && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                                    ชื่อ
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                                    นามสกุล
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="department" className="block text-gray-700 font-medium mb-2">
                                    แผนก
                                </label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    readOnly
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
                            >
                                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </main>
    );
}