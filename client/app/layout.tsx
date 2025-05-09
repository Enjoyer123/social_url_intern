
import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "../providers/NavbarWrapper";
import ThemeProviderC from "../providers/ThemeProvider";
import Navbar from "@/components/navbar/Navbar";
import { AuthContextProvider } from "@/providers/MycontextProvider";
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};




export default function RootLayout({ children }: { children: React.ReactNode }) {

  const excludePaths: string[] = ['/', '/login', '/register', '/landing'];

  // ตรวจสอบว่าเส้นทางปัจจุบันอยู่ในรายการยกเว้นหรือไม่

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">


        <AuthContextProvider>
          <ThemeProviderC>
            
            <NavbarWrapper>
              {children}
            </NavbarWrapper>

          </ThemeProviderC>
        </AuthContextProvider>
      </body>
    </html>
  )
}
