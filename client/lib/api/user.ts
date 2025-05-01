import { UserData } from '@/types/types';
import axiosInstance from './axiosInstance'; // เปลี่ยนมาใช้ axios instance



// Get current user info



export async function getUser(userId: string): Promise<UserData> {

    try {
      const response = await axiosInstance.get(`/user/me`);
      return response.data;
    }
    catch (error) { 
      console.error('Error fetching user data:', error);
      throw error; // หรือจัดการ error ตามที่คุณต้องการ
    }
  }