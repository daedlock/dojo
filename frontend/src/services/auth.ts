import { apiClient } from './api'
import type { AuthResponse, User } from '@/types/api'

export interface LoginCredentials {
  name: string  // username or email
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  website?: string
  affiliation?: string
  country?: string
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/login', credentials)
    
    if (response.success && response.token) {
      apiClient.setToken(response.token)
    }
    
    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/v1/register', data)
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>('/api/v1/logout')
    apiClient.clearToken()
    return response
  }

  async getCurrentUser(): Promise<{ user: User; success: boolean }> {
    return apiClient.get<{ user: User; success: boolean }>('/api/v1/me')
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; success: boolean }> {
    return apiClient.patch<{ user: User; success: boolean }>('/api/v1/me', data)
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message?: string }> {
    return apiClient.patch<{ success: boolean; message?: string }>('/api/v1/me/password', data)
  }

  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>('/api/v1/reset-password', data)
  }

  async confirmResetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>('/api/v1/reset-password/confirm', {
      token,
      password
    })
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>('/api/v1/verify-email', { token })
  }

  async resendVerification(): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>('/api/v1/verify-email/resend')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const authService = new AuthService()