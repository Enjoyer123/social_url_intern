"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser, login, checkUserExists } from '../../lib/api/auth';
import { count } from 'console';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lineId = searchParams.get('lineId');
    const pictureUrl = searchParams.get('pictureUrl');

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

    useEffect(() => {
        if (!lineId) {
            router.push('/');
        }
    }, [lineId, router]);

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
            await login(lineId!);

            // Redirect to home page
            router.push('/home');
        } catch (err) {
            setError('การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const initLiff = async () => {
            try {
                // Import LIFF dynamically
                const { default: liff } = await import('@line/liff');
                
                // Initialize LIFF
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                setIsLiffReady(true);
                
                // Check if user is already logged in with LINE
                if (liff.isLoggedIn()) {
                    handleAutoLogin();
                }
            } catch (error) {
                console.error('LIFF initialization failed', error);
                setError('การเชื่อมต่อกับ LINE ล้มเหลว');
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
            console.error('Auto login failed', error);
            // ดักจับ error แบบเงียบๆ เพื่อไม่ให้แสดงใน console
        } finally {
            setLoading(false);
        }
    };

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