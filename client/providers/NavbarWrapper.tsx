'use client'  // ระบุว่านี่เป็น client component

import { usePathname } from 'next/navigation'
import Navbar from '../components/navbar/Navbar'

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hiddenNavbarPaths = ['/register','/']; //'/login', '/register'
  const isLoginPage = hiddenNavbarPaths.includes(pathname)

  if (isLoginPage) {
    return <>{children}</> // ถ้าเป็นหน้า login หรือ register ไม่แสดง navbar
  }

  return (
    <>
      {!isLoginPage &&
        <Navbar>
          {children}
        </Navbar>
      }
    </>
  )
}
// 'use client'

// import { usePathname } from 'next/navigation'
// import Navbar from '../components/navbar/Navbar'
// import { useEffect, useState } from 'react'

// export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()
//   const [mounted, setMounted] = useState(false)
  
//   // ไม่แสดง navbar สำหรับหน้าเหล่านี้ - เอา '/home' ออกจากรายการ
//   const hiddenNavbarPaths = ['/', '/line', '/register', '/landing']
  
//   // ต้องใช้ useEffect เพื่อแก้ปัญหา hydration mismatch
//   useEffect(() => {
//     setMounted(true)
//   }, [])
  
//   // ใช้ console.log เพื่อ debug
//   useEffect(() => {
//     if (mounted) {
//       console.log('Current pathname:', pathname);
//       console.log('Should hide navbar:', hiddenNavbarPaths.includes(pathname));
//     }
//   }, [pathname, mounted]);
  
//   // ยังไม่ render ถ้า component ยังไม่ mount เพื่อหลีกเลี่ยง hydration error
//   if (!mounted) return <>{children}</> 
  
//   const shouldHideNavbar = hiddenNavbarPaths.includes(pathname)

//   if (shouldHideNavbar) {
//     return <>{children}</>
//   }

//   return (
//     <Navbar>
//       {children}
//     </Navbar>
//   )
// }