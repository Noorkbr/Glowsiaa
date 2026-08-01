import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect to login if it's not an auth endpoint (to avoid redirect loops)
      const url = error.config?.url || ''
      if (!url.includes('/auth/')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
