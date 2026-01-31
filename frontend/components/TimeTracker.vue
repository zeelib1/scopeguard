<template>
  <div class="card">
    <h3 class="font-bold mb-3">Time Tracking</h3>
    
    <div v-if="!activeTimer" class="text-center">
      <button @click="startTimer" class="btn btn-primary" :disabled="starting">
        {{ starting ? '⏳ Starting...' : '▶️ Start Timer' }}
      </button>
    </div>
    
    <div v-else class="space-y-3">
      <div class="text-center">
        <div class="text-3xl font-mono font-bold text-blue-600">
          {{ formatTime(elapsedSeconds) }}
        </div>
        <div class="text-sm text-gray-600 mt-1">
          Started at {{ formatStartTime(activeTimer.start_time) }}
        </div>
        
        <div class="mt-3">
          <input 
            v-model="timerDescription" 
            type="text" 
            class="input text-sm" 
            placeholder="What are you working on?"
          />
        </div>
      </div>
      
      <button @click="stopTimer" class="btn w-full bg-red-600 text-white hover:bg-red-700" :disabled="stopping">
        {{ stopping ? '⏳ Stopping...' : '⏹️ Stop Timer' }}
      </button>
    </div>
    
    <!-- Recent time entries -->
    <div v-if="recentEntries.length" class="mt-4 border-t pt-4">
      <h4 class="font-medium mb-2 text-sm">Recent Entries</h4>
      <div class="space-y-2">
        <div v-for="entry in recentEntries" :key="entry.id" 
             class="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
          <span class="text-gray-700">{{ entry.description || 'Untitled' }}</span>
          <span class="font-medium text-gray-900">{{ formatDuration(entry.duration_minutes) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: number
}>()

const api = useApi()
const activeTimer = ref<any>(null)
const timerDescription = ref('')
const elapsedSeconds = ref(0)
const recentEntries = ref<any[]>([])
const starting = ref(false)
const stopping = ref(false)

let intervalId: any = null

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatStartTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString()
}

const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}

const startTimer = async () => {
  starting.value = true
  try {
    // Create a time entry with start time
    const response: any = await api.createTimeEntry(props.projectId, {
      start_time: new Date().toISOString(),
      description: ''
    })
    
    activeTimer.value = response.timeEntry || { 
      id: response.id, 
      start_time: new Date().toISOString() 
    }
    
    elapsedSeconds.value = 0
    
    // Start interval to update elapsed time
    intervalId = setInterval(() => {
      elapsedSeconds.value++
    }, 1000)
  } catch (err) {
    console.error('Failed to start timer:', err)
    alert('Failed to start timer')
  } finally {
    starting.value = false
  }
}

const stopTimer = async () => {
  if (!activeTimer.value) return
  
  stopping.value = true
  
  // Clear interval
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  
  try {
    // Calculate duration
    const startTime = new Date(activeTimer.value.start_time)
    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
    
    // Update time entry with end time and description
    await api.updateTimeEntry(props.projectId, activeTimer.value.id, {
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      description: timerDescription.value || 'Work session'
    })
    
    // Reset state
    activeTimer.value = null
    timerDescription.value = ''
    elapsedSeconds.value = 0
    
    // Reload recent entries
    await loadRecentEntries()
  } catch (err) {
    console.error('Failed to stop timer:', err)
    alert('Failed to stop timer')
  } finally {
    stopping.value = false
  }
}

const loadRecentEntries = async () => {
  try {
    const response: any = await api.getTimeEntries(props.projectId)
    recentEntries.value = (response.timeEntries || []).slice(0, 5)
  } catch (err) {
    console.error('Failed to load time entries:', err)
  }
}

onMounted(() => {
  loadRecentEntries()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
