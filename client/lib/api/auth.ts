
import axiosInstance from './axiosInstance'; // เปลี่ยนมาใช้ axios instance
import { UserData, CheckUserResponse, AuthStatus, RegisterData } from '../../types/types';

// Check if user exists in database
export async function checkUserExists(lineId: string): Promise<CheckUserResponse> {
  console.log('Checking user existence for lineId:', lineId);
  const response = await axiosInstance.post('/auth/check-user', { lineId });
  console.log('Check user response:', response.data); ////////////////////////////
  return response.data;
}

// Login user
export async function login(lineId: string): Promise<UserData> {
  const response = await axiosInstance.post('/auth/login', { lineId });
  return response.data.user;
}

// Register new user
export async function registerUser(userData: RegisterData): Promise<void> {
  await axiosInstance.post('/user/create-profile', {
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
}

// Check login status

export async function checkLoginStatus(): Promise<AuthStatus> {
  try {
    const response = await axiosInstance.get('/auth/check-login');
    return response.data;
  } catch (error) {
    // ถ้าเป็น error 401 หรือ error อื่นๆ ให้คืนค่าสถานะว่าไม่ได้ login แทนการ throw error
    return { isLoggedIn: false, user: null };
  }
}



// Refresh token



export async function refreshToken(): Promise<boolean> {
  try {
    const response = await axiosInstance.post('/auth/refresh-token');
    return response.data.success === true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}


// Logout
export async function logout(): Promise<void> {
  try {
    await axiosInstance.post('/auth/logout');

    // Logout from LIFF if necessary
    try {
      const { default: liff } = await import('@line/liff');
      if (liff.isLoggedIn()) {
        liff.logout();
        console.log('LIFF logged out successfully');
      }
    } catch (liffError) {
      console.error('LIFF logout error:', liffError);
    }

    // Optional: Clear localStorage / sessionStorage if used
    // localStorage.removeItem('user');
    // sessionStorage.removeItem('user');

  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// // Get current user info

// export async function getUser(userId: string): Promise<UserData> {

//   try {
//     const response = await axiosInstance.get(`/user/me`);
//     return response.data;
//   }
//   catch (error) { 
//     console.error('Error fetching user data:', error);
//     throw error; // หรือจัดการ error ตามที่คุณต้องการ
//   }
// }


export async function test () {
  try {
    const response = await axiosInstance.get('/auth/ping');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};