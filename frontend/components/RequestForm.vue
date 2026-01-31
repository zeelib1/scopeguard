<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">New Request</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Request Description</label>
        <textarea 
          v-model="form.description" 
          required 
          rows="4" 
          class="input" 
          placeholder="Describe the change request..."
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Estimated Hours</label>
        <input 
          v-model.number="form.estimated_hours" 
          type="number" 
          step="0.5" 
          class="input" 
          placeholder="2.5"
          min="0"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Priority</label>
        <select v-model="form.priority" class="input">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating...' : 'Create Request' }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
          Cancel
        </button>
      </div>
      
      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: number
}>()

const emit = defineEmits(['success', 'cancel'])

const api = useApi()
const loading = ref(false)
const error = ref('')

const form = reactive({
  description: '',
  estimated_hours: 1,
  priority: 'medium'
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await api.createRequest(props.projectId, form)
    emit('success')
    
    // Reset form
    form.description = ''
    form.estimated_hours = 1
    form.priority = 'medium'
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to create request'
  } finally {
    loading.value = false
  }
}
</script>
