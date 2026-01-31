export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  
  // Load auth from storage on first load
  if (!auth.token) {
    auth.loadFromStorage()
  }
  
  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
