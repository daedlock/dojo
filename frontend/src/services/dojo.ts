import { apiClient } from './api'

export interface DojoListResponse {
  success: boolean
  dojos: Array<{
    id: string
    name: string
    description?: string
    official: boolean
  }>
}

export interface DojoModulesResponse {
  success: boolean
  modules: Array<{
    id: string
    name: string
    description?: string
    challenges: Array<{
      id: string
      name: string
      required: boolean
      description?: string
    }>
  }>
}

export interface DojoSolvesResponse {
  success: boolean
  solves: Array<{
    timestamp: string
    module_id: string
    challenge_id: string
  }>
}

export interface DojoCourseResponse {
  success: boolean
  course: {
    syllabus?: any
    scripts?: any
    student?: {
      token: string
      user_id: number
      [key: string]: any
    }
  }
}

export interface CreateDojoData {
  repository: string
  spec?: string
  public_key?: string
  private_key?: string
}

export interface SolveSubmission {
  [key: string]: any // Challenge-specific submission data
}

export interface SurveyResponse {
  response: string
}

class DojoService {
  // Get all available dojos
  async getDojos(): Promise<DojoListResponse> {
    return apiClient.get<DojoListResponse>('/dojos')
  }

  // Create a new dojo
  async createDojo(data: CreateDojoData): Promise<{ success: boolean; dojo?: string; error?: string }> {
    return apiClient.post('/dojos/create', data)
  }

  // Get dojo modules
  async getDojoModules(dojoId: string): Promise<DojoModulesResponse> {
    return apiClient.get<DojoModulesResponse>(`/dojos/${dojoId}/modules`)
  }

  // Get user's solves in a dojo
  async getDojoSolves(dojoId: string, username?: string, after?: string): Promise<DojoSolvesResponse> {
    const params = new URLSearchParams()
    if (username) params.append('username', username)
    if (after) params.append('after', after)
    
    const query = params.toString()
    return apiClient.get<DojoSolvesResponse>(`/dojos/${dojoId}/solves${query ? '?' + query : ''}`)
  }

  // Get dojo course information
  async getDojoCourse(dojoId: string): Promise<DojoCourseResponse> {
    return apiClient.get<DojoCourseResponse>(`/dojos/${dojoId}/course`)
  }

  // Submit solution for a challenge
  async submitChallengeSolution(
    dojoId: string, 
    moduleId: string, 
    challengeId: string, 
    submission: SolveSubmission
  ): Promise<{ success: boolean; status?: string; error?: string }> {
    return apiClient.post(`/dojos/${dojoId}/${moduleId}/${challengeId}/solve`, submission)
  }

  // Get challenge description
  async getChallengeDescription(
    dojoId: string, 
    moduleId: string, 
    challengeId: string
  ): Promise<{ success: boolean; description?: string; error?: string }> {
    return apiClient.get(`/dojos/${dojoId}/${moduleId}/${challengeId}/description`)
  }

  // Get challenge survey
  async getChallengeSurvey(
    dojoId: string, 
    moduleId: string, 
    challengeId: string
  ): Promise<{ 
    success: boolean
    type: string
    prompt?: string
    data?: any
    probability?: number
  }> {
    return apiClient.get(`/dojos/${dojoId}/${moduleId}/${challengeId}/surveys`)
  }

  // Submit survey response
  async submitSurveyResponse(
    dojoId: string, 
    moduleId: string, 
    challengeId: string, 
    response: SurveyResponse
  ): Promise<{ success: boolean; error?: string }> {
    return apiClient.post(`/dojos/${dojoId}/${moduleId}/${challengeId}/surveys`, response)
  }

  // Admin endpoints
  async promoteAdmin(dojoId: string, userId: number): Promise<{ success: boolean; error?: string }> {
    return apiClient.post(`/dojos/${dojoId}/admins/promote`, { user_id: userId })
  }

  async promoteDojo(dojoId: string): Promise<{ success: boolean }> {
    return apiClient.post(`/dojos/${dojoId}/promote`)
  }

  async pruneAwards(dojoId: string): Promise<{ success: boolean; pruned_awards?: number }> {
    return apiClient.post(`/dojos/${dojoId}/awards/prune`)
  }

  // Course admin endpoints
  async getCourseStudents(dojoId: string): Promise<{
    success: boolean
    students: {
      [token: string]: {
        token?: string
        user_id?: number
        [key: string]: any
      }
    }
  }> {
    return apiClient.get(`/dojos/${dojoId}/course/students`)
  }

  async getCourseSolves(dojoId: string, after?: string): Promise<{
    success: boolean
    solves: Array<{
      timestamp: string
      student_token: string
      user_id: number
      module_id: string
      challenge_id: string
    }>
  }> {
    const params = new URLSearchParams()
    if (after) params.append('after', after)
    
    const query = params.toString()
    return apiClient.get(`/dojos/${dojoId}/course/solves${query ? '?' + query : ''}`)
  }
}

export const dojoService = new DojoService()