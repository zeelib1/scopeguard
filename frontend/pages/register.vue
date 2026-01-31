<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="card max-w-md w-full">
      <h1 class="text-3xl font-bold text-center mb-2">Create Account</h1>
      <p class="text-center text-gray-600 mb-8">Start protecting your scope today</p>
      
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Full Name</label>
          <input v-model="fullName" type="text" required class="input" placeholder="John Doe" />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Email</label>
          <input v-model="email" type="email" required class="input" placeholder="you@example.com" />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Password</label>
          <input v-model="password" type="password" required minlength="6" class="input" placeholder="At least 6 characters" />
        </div>
        
        <button type="submit" :disabled="loading" class="btn btn-primary w-full mb-4">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
        
        <p class="text-center text-sm">
          Already have an account? 
          <NuxtLink to="/login" class="text-blue-600 hover:underline">Log in</NuxtLink>
        </p>
      </form>
      
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const auth = useAuthStore()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response: any = await api.register({ 
      full_name: fullName.value, 
      email: email.value, 
      password: password.value 
    })
    auth.setAuth(response.token, response.user)
    await router.push('/')
  } catch (err: any) {
    error.value = err.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
