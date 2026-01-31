export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const token = auth.token
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        auth.logout()
        navigateTo('/login')
      }
    }
  })

  return {
    // Auth
    login: (credentials: { email: string; password: string }) =>
      apiFetch('/auth/login', { method: 'POST', body: credentials }),
    
    register: (data: { email: string; password: string; full_name: string }) =>
      apiFetch('/auth/register', { method: 'POST', body: data }),
    
    me: () => apiFetch('/auth/me'),

    // Projects
    getProjects: (status?: string) =>
      apiFetch('/projects', { params: { status } }),
    
    getProject: (id: number) => apiFetch(`/projects/${id}`),
    
    createProject: (data: any) =>
      apiFetch('/projects', { method: 'POST', body: data }),
    
    updateProject: (id: number, data: any) =>
      apiFetch(`/projects/${id}`, { method: 'PUT', body: data }),
    
    deleteProject: (id: number) =>
      apiFetch(`/projects/${id}`, { method: 'DELETE' }),

    // Scope Items
    getScopeItems: (projectId: number) =>
      apiFetch(`/projects/${projectId}/scope-items`),
    
    createScopeItem: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/scope-items`, { method: 'POST', body: data }),
    
    updateScopeItem: (projectId: number, id: number, data: any) =>
      apiFetch(`/projects/${projectId}/scope-items/${id}`, { method: 'PUT', body: data }),

    // Requests
    getRequests: (projectId: number, status?: string) =>
      apiFetch(`/projects/${projectId}/requests`, { params: { status } }),
    
    createRequest: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/requests`, { method: 'POST', body: data }),
    
    updateRequest: (projectId: number, id: number, data: any) =>
      apiFetch(`/projects/${projectId}/requests/${id}`, { method: 'PUT', body: data }),

    // Change Orders
    getChangeOrders: (projectId: number) =>
      apiFetch(`/projects/${projectId}/change-orders`),
    
    createChangeOrder: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/change-orders`, { method: 'POST', body: data }),
    
    approveChangeOrder: (projectId: number, id: number) =>
      apiFetch(`/projects/${projectId}/change-orders/${id}/approve`, { method: 'POST' }),

    // Dashboard
    getDashboard: (projectId: number) =>
      apiFetch(`/projects/${projectId}/status`),

    // Budget
    getProjectBudget: (projectId: number) =>
      apiFetch(`/budget/project/${projectId}`),

    // Communications
    getCommunications: (projectId: number) =>
      apiFetch(`/projects/${projectId}/communications`),
    
    createCommunication: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/communications`, { method: 'POST', body: data }),

    // Team
    getTeamMembers: (projectId: number) =>
      apiFetch(`/projects/${projectId}/team`),
    
    addTeamMember: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/team`, { method: 'POST', body: data }),

    // Reports
    getReports: () => apiFetch('/reports'),
    generateReport: (projectId: number) =>
      apiFetch(`/reports/project/${projectId}`, { method: 'POST' }),

    // Time Entries
    getTimeEntries: (projectId: number) =>
      apiFetch(`/projects/${projectId}/time-entries`),
    
    createTimeEntry: (projectId: number, data: any) =>
      apiFetch(`/projects/${projectId}/time-entries`, { method: 'POST', body: data }),
    
    updateTimeEntry: (projectId: number, id: number, data: any) =>
      apiFetch(`/projects/${projectId}/time-entries/${id}`, { method: 'PUT', body: data }),

    // Attachments/Files
    uploadFile: (projectId: number, requestId: number, formData: FormData) =>
      apiFetch(`/projects/${projectId}/requests/${requestId}/attachments`, { 
        method: 'POST', 
        body: formData 
      }),
    
    getAttachments: (projectId: number, requestId: number) =>
      apiFetch(`/projects/${projectId}/requests/${requestId}/attachments`)
  }
}
