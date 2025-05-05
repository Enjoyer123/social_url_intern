'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserData, LoginData, loginStatus } from '@/types/types';
import { checkUserExistsServer, checkLoginStatus, loginUser,logoutUser } from '@/lib/api/auth';
import { getUserData } from '@/lib/api/user';
import liff from '@line/liff';
import axiosInstance from '@/lib/api/axiosInstance';

type AuthContextType = {
  user: LoginData | null;
  setUser: (user: LoginData | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkLiffLogin: () => Promise<boolean>;
  lineProfile: LineProfile | null;
  setLineProfile: (profile: LineProfile | null) => void;
  getUser: (lineId: string) => Promise<UserData | null>;
  login: (lineId: string) => Promise<void>;
  logout: () => Promise<void>;
};

interface LineProfile {
  userId: string;
  pictureUrl: string | null;
  displayName: string | null;
}

// รายการ paths ที่ไม่ต้องใช้ Auth Context
const publicPaths = [ '/eiei', '/eiei2'];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lineProfile, setLineProfile] = useState<LineProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ตรวจสอบว่า path ปัจจุบันเป็น public path หรือไม่
  const isPublicPath = publicPaths.includes(pathname);
  // Check authentication status on page load
  useEffect(() => {

     // ถ้าเป็น public path ให้ข้ามการตรวจสอบ auth
     if (isPublicPath) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      setIsLoading(true);
      try {
        // First check if server says we're logged in via cookies
        const loginStatus = await checkLoginStatus() as loginStatus
        console.log("loginstatus",loginStatus)
        if (loginStatus.isLoggedIn && loginStatus.user) {
          // If logged in via server cookies, set user data
          setUser(loginStatus.user as LoginData);
          setIsAuthenticated(true);
        } else {
          // If not authenticated via cookies, try LIFF
          await initLiff();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Initialize LIFF
  const initLiff = async () => {
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
      
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        const { userId, pictureUrl, displayName } = profile;
        
        setLineProfile({
          userId,
          pictureUrl: pictureUrl ?? null,
          displayName,
        });
        
        // Check if this LINE user exists in our system
        const userExists = await checkUserExistsServer(userId);
        console.log("userecitrt",userExists)
        if (userExists.data) {
          // If user exists, get their data and log them in
          await login(userId);
        } else {
          // User doesn't exist in our system
          setIsAuthenticated(false);
          // You might want to redirect to registration here
        }
      }
    } catch (error) {
      console.error('LIFF initialization error:', error);
    }
  };

  // Function to check LIFF login
  const checkLiffLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
      
      const isLoggedIn = liff.isLoggedIn();
      
      if (isLoggedIn) {
        const profile = await liff.getProfile();
        const { userId, pictureUrl, displayName } = profile;
        
        setLineProfile({
          userId,
          pictureUrl: pictureUrl ?? null,
          displayName,
        });
      }
      
      setIsLoading(false);
      return isLoggedIn;
    } catch (error) {
      console.error('LIFF login check error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Function to get user data
  const getUser = async (lineId: string): Promise<UserData | null> => {
    try {
      const userData = await getUserData(lineId);
     
      
      return userData;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  };

  // Function to login user
  const login = async (lineId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call your login API endpoint
      const response = await loginUser(lineId)
      
      
      
    
      console.log("data",response)
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('Login successful, user data:', response.data);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call logout API to clear cookies
      await logoutUser();

      console.log("line isloggin",liff.isLoggedIn())
      
      // Clear LIFF login if applicable
      if (liff.isLoggedIn()) {
        
        liff.logout();
        console.log("line islogout",liff.isLoggedIn())
      }
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setLineProfile(null);
      
      // Redirect to home or login page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // ถ้าอยู่ใน public path ให้แสดง children โดยตรง
  if (isPublicPath) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isLoading,
      isAuthenticated,
      checkLiffLogin,
      lineProfile,
      setLineProfile,
      getUser,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used inside AuthContextProvider');
//   return context;
// };

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // ถ้าอยู่ใน path ที่ไม่ใช้ Auth Context แต่มีการเรียกใช้ useAuth
  // จะแสดงข้อความเตือนแทนการ throw error
  if (!context) {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    
    if (publicPaths.includes(pathname)) {
      console.warn(`useAuth was called in a public path (${pathname}). Auth context is not available here.`);
      
      // Return a dummy context with default values to prevent crashes
      return {
        user: null,
        setUser: () => {},
        isLoading: false,
        isAuthenticated: false,
        checkLiffLogin: async () => false,
        lineProfile: null,
        setLineProfile: () => {},
        getUser: async () => null,
        login: async () => {},
        logout: async () => {},
      } as AuthContextType;
    }
    
    throw new Error('useAuth must be used inside AuthContextProvider');
  }
  
  return context;
};