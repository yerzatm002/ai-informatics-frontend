import api from './client'

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
}

export const learningApi = {
  topics: () => api.get('/topics'),
  topic: (id) => api.get(`/topics/${id}`),
  tasks: (topicId) => api.get(`/topics/${topicId}/tasks`),
  submitTask: (taskId, answer) => api.post(`/tasks/${taskId}/submit`, { answer }),
  progress: () => api.get('/me/progress'),
}

export const testApi = {
  get: (type) => api.get(`/tests/${type}`),
  submit: (type, answers) => api.post(`/tests/${type}/submit`, { answers }),
}

export const agentApi = {
  chat: (payload) => api.post('/agent/chat', payload),
}

export const surveyApi = {
  get: () => api.get('/survey'),
  submit: (answers) => api.post('/survey/submit', { answers }),
}

export const adminApi = {
  analytics: (includeDemo = true) => api.get('/admin/analytics', { params: { include_demo: includeDemo } }),
  users: (includeDemo = true) => api.get('/admin/users', { params: { include_demo: includeDemo } }),
  exportCsv: (includeDemo = false) => api.get('/admin/export', {
    params: { include_demo: includeDemo },
    responseType: 'blob',
  }),
}
