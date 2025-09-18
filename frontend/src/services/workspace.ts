import { apiClient } from './api'

export interface WorkspaceResponse {
  success: boolean
  active: boolean
  iframe_src?: string
  service?: string
  error?: string
}

class WorkspaceService {
  // Get workspace iframe URL for a service
  async getWorkspace(params: {
    user?: string
    password?: string
    service?: string
  }): Promise<WorkspaceResponse> {
    const searchParams = new URLSearchParams()
    if (params.user) searchParams.append('user', params.user)
    if (params.password) searchParams.append('password', params.password)
    if (params.service) searchParams.append('service', params.service)

    const query = searchParams.toString()
    return apiClient.get<WorkspaceResponse>(`/api/v1/workspace${query ? '?' + query : ''}`)
  }

  // Reset user's home directory
  async resetHome(): Promise<{ success: boolean; error?: string; message?: string }> {
    return apiClient.post('/api/v1/workspace/reset_home')
  }
}

export const workspaceService = new WorkspaceService()