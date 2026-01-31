<template>
  <div>
    <div 
      @drop.prevent="handleDrop"
      @dragover.prevent
      @dragenter="dragging = true"
      @dragleave="dragging = false"
      class="border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer"
      :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'"
      @click="triggerFileInput"
    >
      <input 
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileSelect"
        class="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
      />
      
      <div class="text-gray-600">
        <svg class="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="font-medium">Click or drag files to upload</p>
        <p class="text-sm text-gray-500 mt-1">PNG, JPG, PDF, DOC, DOCX (max 10MB each)</p>
      </div>
    </div>
    
    <div v-if="files.length" class="mt-4 space-y-2">
      <div v-for="(file, i) in files" :key="i" 
           class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
          </div>
        </div>
        <button 
          @click="removeFile(i)" 
          class="flex-shrink-0 text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
          :disabled="uploading"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <button 
        @click="uploadFiles" 
        class="btn btn-primary w-full" 
        :disabled="uploading || files.length === 0"
      >
        <span v-if="uploading" class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading... {{ uploadProgress }}%
        </span>
        <span v-else>Upload {{ files.length }} file{{ files.length > 1 ? 's' : '' }}</span>
      </button>
    </div>
    
    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: number
  requestId: number
}>()

const emit = defineEmits(['uploaded'])

const api = useApi()
const files = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  dragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (newFiles: File[]) => {
  error.value = ''
  
  // Validate files
  const validFiles = newFiles.filter(file => {
    if (file.size > MAX_FILE_SIZE) {
      error.value = `${file.name} is too large (max 10MB)`
      return false
    }
    return true
  })
  
  files.value = [...files.value, ...validFiles]
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const uploadFiles = async () => {
  if (files.value.length === 0) return
  
  uploading.value = true
  error.value = ''
  uploadProgress.value = 0
  
  try {
    // Upload files one by one
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      const formData = new FormData()
      formData.append('file', file)
      
      await api.uploadFile(props.projectId, props.requestId, formData)
      
      uploadProgress.value = Math.round(((i + 1) / files.value.length) * 100)
    }
    
    // Success
    files.value = []
    emit('uploaded')
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to upload files'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>
