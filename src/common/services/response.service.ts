import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseService {
  success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  error(message: string, statusCode = 400, data: any = null): ApiResponse {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }
} 