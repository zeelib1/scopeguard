<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Team</h1>
      <button class="btn btn-primary">+ Invite Member</button>
    </div>

    <div class="card">
      <div class="space-y-4">
        <div v-for="member in teamMembers" :key="member.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <div class="font-medium">{{ member.name }}</div>
              <div class="text-sm text-gray-600">{{ member.email }}</div>
            </div>
          </div>
          <StatusBadge :status="member.role" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const teamMembers = ref([
  { id: 1, name: 'You', email: 'you@example.com', role: 'owner' },
])
</script>
