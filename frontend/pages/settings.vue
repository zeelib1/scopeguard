<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <div class="space-y-6">
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Profile</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input type="text" :value="auth.currentUser?.name" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input type="email" :value="auth.currentUser?.email" class="input" disabled />
          </div>
          <button class="btn btn-primary">Save Changes</button>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-4">Notifications</h2>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input type="checkbox" checked class="w-4 h-4" />
            <span>Email notifications for new requests</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" checked class="w-4 h-4" />
            <span>Weekly digest reports</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" class="w-4 h-4" />
            <span>Scope item warnings</span>
          </label>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-4">Webhooks</h2>
        <p class="text-gray-600 mb-4">Connect ScopeGuard to your other tools</p>
        <button class="btn btn-secondary">+ Add Webhook</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const auth = useAuthStore()
</script>
