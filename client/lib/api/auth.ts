
import axiosInstance from './axiosInstance'; // เปลี่ยนมาใช้ axios instance
import { UserData, CheckUserResponse, AuthStatus, RegisterData, LoginData } from '../../types/types';
import liff from '@line/liff';
import { useAuth } from '@/providers/MycontextProvider'; // ปรับให้ตรงกับ path ของไฟล์ context provider


// ตัวอย่าง interface สำหรับการตอบกลับ


interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// refreshToken
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await axiosInstance.post('/auth/refresh-token');
    console.log("refreshToken",response)

    return response.data.success === true;
  } catch (error) {
    return false;
  }
}

// register
export async function registerUser(userData: RegisterData): Promise<ApiResponse> {

  try {
    const response = await axiosInstance.post<ApiResponse>('/user/create-profile', {
      first_name: userData.firstName,
      last_name: userData.lastName,
      line_id: userData.lineId,
      email: userData.email,
      phone: userData.phone,
      department: userData.department,
      picture_url: userData.pictureUrl,
      role_id: 1,
      cardNumber: userData.cardNumber,
    });

    console.log("register",response)

    return {
      success: true,
      message: 'User registered successfully',
      data: response.data
    };

  } catch (error: any) {

    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
}

// Check if a user exists in the system by LINE ID
export const checkUserExistsServer = async (lineId: string): Promise<ApiResponse<{exist: boolean;}>> => {
  
  try {
   
    const response = await axiosInstance.post<ApiResponse<{exist: boolean; }>>('/auth/check-user', { lineId });
    console.log("checkUserExistsServer",response)

    return response.data;
  
  } catch (error: any) {
  
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to check user existence',
      message: 'Failed to check if user exists'
    };
  }
};


// Check current login status
export const checkLoginStatus = async (): Promise<{ isLoggedIn: boolean; user?: UserData }> => {
  try {
    const response = await axiosInstance.get<{ isLoggedIn: boolean; user?: UserData }>('/auth/status');
    console.log("checkLoginStatus", response);

    // ถ้า isLoggedIn เป็น true, return ค่าเป็น isLoggedIn และ user
    if (response.data.isLoggedIn) {
      return {
        isLoggedIn: true,
        user: response.data.user
      };
    }

    // ถ้าไม่ login ก็ส่งแค่ isLoggedIn: false
    return {
      isLoggedIn: false
    };

  } catch (error) {
    console.error("Error checking login status:", error);

    // ถ้าเกิดข้อผิดพลาดใดๆ, return isLoggedIn: false และไม่มี user
    return {
      isLoggedIn: false
    };
  }
};


// Login user
export const loginUser = async (lineId: string): Promise<{ success: boolean; data?: LoginData; error?: string }> => {
  try {
    const response = await axiosInstance.post('/auth/login', { lineId });
   console.log("loginUser",response)
    return response.data;
  } catch (error:any) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};


// Logout
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  try {
    await axiosInstance.post('/auth/logout');
    delete axiosInstance.defaults.headers.common['Authorization'];
    // Logout from LIFF if necessary
    try {
      if (liff && typeof liff.isLoggedIn === 'function' && liff.isLoggedIn()) {
        liff.logout();
      }
    } catch (liffError) {
      console.error('LIFF logout error:', liffError);
      // ถึงแม้จะมี error จาก LIFF แต่เราไม่ต้องการให้มันส่งผลต่อการ logout จากระบบของเรา
    }
    return { success: true, message: 'Logged out successfully' };

  } catch (error : any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Logout failed' 
    };
  }
}