'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const KickPage = () => {
  const router = useRouter();

  useEffect(() => {
    // หากต้องการให้ redirect ไปหน้า login หลังจากที่แสดงข้อความสักระยะหนึ่ง
    const timeout = setTimeout(() => {
      router.push('/'); // เปลี่ยนเส้นทางไปหน้า login
    }, 5000); // 5 วินาทีหลังจากโหลดหน้า kick

    // ทำความสะอาดตัวแปรเวลา
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>คุณยังไม่ได้ล็อกอิน</h1>
      <p>โปรดล็อกอินก่อนที่จะเข้าถึงหน้านี้</p>
      <p>คุณจะถูกนำไปที่หน้าล็อกอินใน 5 วินาที...</p>
      <button onClick={() => router.push('/login')}>ไปที่หน้าล็อกอิน</button>
    </div>
  );
};

export default KickPage;
