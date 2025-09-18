// Workspace proxy service to bypass CTFd restrictions
export class WorkspaceProxy {
  private baseUrl: string

  constructor() {
    // We'll create a simple proxy server that forwards to CTFd workspace
    this.baseUrl = 'http://localhost:3001' // Proxy server port
  }

  // Get workspace service URL through our proxy
  getServiceUrl(service: 'terminal' | 'code' | 'desktop'): string {
    return `${this.baseUrl}/workspace/${service}`
  }

  // Check if workspace services are available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  // Start workspace proxy (this would be called from a separate process)
  static startProxy() {
    // This would start a Node.js express server that:
    // 1. Accepts requests from our React app
    // 2. Forwards them to CTFd workspace with proper cookies
    // 3. Returns the responses back to our React app
    console.log('Workspace proxy should be started separately')
  }
}

export const workspaceProxy = new WorkspaceProxy()