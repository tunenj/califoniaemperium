// service/supportService.ts
import api from '@/api/api';
import { endpoints } from '@/api/endpoints';

export interface SupportRequest {
  name: string;
  email: string;
  complaint: string;
  order_number?: string;
  phone?: string;
}

export interface SupportResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    ticket_number: string;
    status: 'pending' | 'in_progress' | 'resolved';
    created_at: string;
  };
}

class SupportService {
  async submitSupportRequest(request: SupportRequest): Promise<SupportResponse> {
    try {
      // ✅ api instance already has authToken in headers set by AuthContext
      // No need to manually read from AsyncStorage
      const response = await api.post<SupportResponse>(endpoints.support, request);
      return response.data;
    } catch (error: any) {
      console.error('Support request error:', error);

      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      throw new Error(
        error.response?.data?.message ||
        'Failed to submit support request. Please try again.'
      );
    }
  }
}

export default new SupportService();