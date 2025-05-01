'use client'  // ระบุว่านี่เป็น client component

import { usePathname } from 'next/navigation'
import Navbar from '../components/navbar/Navbar'

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hiddenNavbarPaths = ['/']; //'/login', '/register'
  const isLoginPage = hiddenNavbarPaths.includes(pathname)


  return (
    <>
      {!isLoginPage &&
        <Navbar >
          {children}
        </Navbar>
      }
    </>
  )
}