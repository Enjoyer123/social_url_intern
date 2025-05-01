// // services/axiosInstance.ts
// import axios, { AxiosRequestConfig } from 'axios';

// const API_BASE_URL = 'http://localhost:8000';



// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
// });

// // // เพิ่มตัวจัดการ response interceptor ที่ไม่ทำการ reload หน้า
// // axiosInstance.interceptors.response.use(
// //   (response) => response,
// //   async (error) => {
// //     if (
// //       error.response?.status === 401 &&
// //       !error.config.url.includes('/auth/refresh-token') &&
// //       !error.config._retry
// //     ) {
// //       error.config._retry = true; // Mark the request as retried
// //       try {
// //         console.log('Token expired, trying to refresh...');
// //         const refreshResult = await axiosInstance.post('/auth/refresh-token');
// //         if (refreshResult.data.success) {
// //           // Retry the original request
// //           return axiosInstance(error.config);
// //         } else {
// //           console.log('Token refresh failed, redirecting to login...');
// //           alert('หมดเวลา กรุณา login ใหม่');

// //           window.location.href = '/'; // Redirect to login page
// //           return Promise.reject(error);
// //         }
// //       } catch (refreshError) {
// //         console.error('Error during token refresh:', refreshError);
// //         alert('หมดเวลา กรุณา login ใหม่');

// //         window.location.href = '/'; // Redirect to login page
// //         return Promise.reject(error);
// //       }
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default axiosInstance;


// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (
//       error.response?.status === 401 &&
//       !error.config.url.includes('/auth/refresh-token') &&
//       !error.config._retry
//     ) {
//       error.config._retry = true;

//       try {
//         console.log('Token expired, trying to refresh...');
//         const refreshResult = await axiosInstance.post('/auth/refresh-token');

//         if (refreshResult.data.success) {
//           // ✅ ได้ access token ใหม่ → รีส่ง request เดิม
//           return axiosInstance(error.config);
//         } else {
//           // ⛔ refresh token หมด → ตรงนี้รู้ว่า "หมดอายุ"
//           alert('หมดเวลา กรุณา login ใหม่');
//           window.location.href = '/';
//           return Promise.reject(error);
//         }

//       } catch (refreshError) {
//         // ⛔ กรณี refresh token invalid / server ไม่ตอบ
//         alert('หมดเวลา กรุณา login ใหม่');
//         window.location.href = '/';
//         return Promise.reject(refreshError);
//       }
//     }

//         // 🔴 ถ้าเป็น 403 แปลว่ามี token แต่ไม่มีสิทธิ์
//         if (error.response?.status === 403) {
//           alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
//           window.location.href = '/';
//           return Promise.reject(error);
//         }

//     return Promise.reject(error);
//   }
// );


// export default axiosInstance;


import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
const API_BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// // ฟังก์ชันสำหรับ logout และลบ token ที่ server
// const logoutAndClearSession = async () => {
//   try {
//     // ส่ง request ไปยัง server เพื่อลบ refreshToken (blacklist)
//     await axiosInstance.post('/auth/logout');
//   } catch (error) {
//     console.error('Error during logout:', error);
//   } finally {
//     // ไม่ว่าจะสำเร็จหรือไม่ ก็ redirect ไปหน้า login
//     window.location.href = '/';
//   }
// };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/refresh-token') &&
      !error.config._retry
    ) {
      error.config._retry = true;

      try {
        
        console.log('Token expired, trying to refresh...');
        const refreshResult = await axiosInstance.post('/auth/refresh-token');
        console.log("refreshToken",refreshResult)
        if (refreshResult.data.success) {
          // ✅ ได้ access token ใหม่ → รีส่ง request เดิม
          return axiosInstance(error.config);
        } else {
          //⛔ refresh token หมด → ตรงนี้รู้ว่า "หมดอายุ"
          // alert('หมดเวลา กรุณา login ใหม่');

          

          toast("หมดเวลา กรุณา login ใหม่", {
            description: "กำลังนำคุณไปยังหน้า login",
            duration: 5000,

        })
              window.location.href = '/';

          // await logoutAndClearSession(); // ลบ token ที่ server ก่อน redirect
          return Promise.reject(error);
        }

      } catch (refreshError) {
        // console.error('Refresh token error details:', refreshError.response?.data || refreshError.message);

        //⛔ กรณี refresh token invalid / server ไม่ตอบ
        toast("หมดเวลา กรุณา login ใหม่2", {
          description: "กำลังนำคุณไปยังหน้า login",
          duration: 5000,

      })
          window.location.href = '/';

        // await logoutAndClearSession(); // ลบ token ที่ server ก่อน redirect
        return Promise.reject(refreshError);
      }
    }

    // // 🔴 ถ้าเป็น 403 แปลว่ามี token แต่ไม่มีสิทธิ์
    // if (error.response?.status === 403) {
    //   alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    //   // สำหรับ 403 อาจไม่จำเป็นต้อง logout ก็ได้ แต่ถ้าต้องการให้ logout ก็สามารถใช้ได้
    //   // await logoutAndClearSession();
    //   window.location.href = '/';
    //   return Promise.reject(error);
    // }

    return Promise.reject(error);
  }
);

// // เพิ่มฟังก์ชัน logout สำหรับเรียกใช้โดยตรงจากที่อื่น (เช่น ปุ่ม logout)
// export const logout = async () => {
//   await logoutAndClearSession();
// };

export default axiosInstance;