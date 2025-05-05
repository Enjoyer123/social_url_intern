
import { Response } from 'express';
import { FlexibleErrorResponse } from '../types/auth';



export const sendAuthError = (res: Response, error: FlexibleErrorResponse): void => {
  const { status, message, code, errorData } = error;

  // สร้าง response body ที่สามารถรองรับข้อมูลเสริม
  const responseBody: any = {
    success: false,
    error: {
      message,
      code,
    },
  };

  if (errorData !== undefined) {
    responseBody.error.data = errorData; // ถ้ามีข้อมูลเสริมก็จะส่งออก
  }

  res.status(status).json(responseBody);
};



interface FlexibleSuccessResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T | null;
}

export const sendSuccessResponse = <T>(
  res: Response,
  payload: FlexibleSuccessResponse<T>
): void => {
  const { status, message, data } = payload;

  const responseBody: any = {
    success: true
  };

  if (message !== undefined) responseBody.message = message;
  if (data !== undefined) responseBody.data = data;

  res.status(status).json(responseBody);
};
