<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <ProjectForm @success="handleSuccess" @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

const handleSuccess = () => {
  router.push('/projects')
}

const handleCancel = () => {
  router.push('/projects')
}
</script>
