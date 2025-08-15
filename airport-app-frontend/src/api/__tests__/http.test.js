import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios.create
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    }))
  }
}))

describe('HTTP Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('creates axios instance with correct configuration', async () => {
    const mockedAxios = vi.mocked(axios)
    
    // Mock environment variables before importing
    vi.stubEnv('VITE_API_BASE_URL', '/api')
    vi.stubEnv('VITE_API_TIMEOUT', '15000')
    
    // Import after setting env vars
    await import('../http')
    
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('sets up response interceptor', async () => {
    const mockInterceptors = {
      response: {
        use: vi.fn()
      }
    }
    
    const mockedAxios = vi.mocked(axios)
    mockedAxios.create.mockReturnValue({
      interceptors: mockInterceptors
    })
    
    await import('../http')
    
    expect(mockInterceptors.response.use).toHaveBeenCalled()
  })
})
