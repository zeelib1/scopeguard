<template>
  <div class="card">
    <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Edit' : 'New' }} Project</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Project Name</label>
        <input 
          v-model="form.project_name" 
          required 
          class="input" 
          placeholder="Website Redesign"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Client Name</label>
        <input 
          v-model="form.client_name" 
          required 
          class="input" 
          placeholder="Acme Corp"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Client Email</label>
        <input 
          v-model="form.client_email" 
          type="email" 
          required 
          class="input" 
          placeholder="client@acme.com"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Total Budget ($)</label>
        <input 
          v-model.number="form.total_budget" 
          type="number" 
          required 
          class="input" 
          placeholder="5000"
          min="0"
          step="100"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Start Date</label>
        <input 
          v-model="form.start_date" 
          type="date" 
          required 
          class="input" 
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">End Date (Optional)</label>
        <input 
          v-model="form.end_date" 
          type="date" 
          class="input" 
        />
      </div>
      
      <div class="flex gap-2 pt-4">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Project' }}
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
  project?: any
  isEdit?: boolean
}>()

const emit = defineEmits(['success', 'cancel'])

const api = useApi()
const loading = ref(false)
const error = ref('')

const form = reactive({
  project_name: props.project?.project_name || '',
  client_name: props.project?.client_name || '',
  client_email: props.project?.client_email || '',
  total_budget: props.project?.total_budget || 0,
  start_date: props.project?.start_date?.split('T')[0] || '',
  end_date: props.project?.end_date?.split('T')[0] || ''
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (props.isEdit && props.project?.id) {
      await api.updateProject(props.project.id, form)
    } else {
      await api.createProject(form)
    }
    emit('success')
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to save project'
  } finally {
    loading.value = false
  }
}
</script>
