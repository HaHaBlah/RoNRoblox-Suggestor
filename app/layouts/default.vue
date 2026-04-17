<!-- layouts/default.vue -->
<script setup>
    import CompTopNav from '@/components/CompTopNav.vue';
    import CompFooter from '@/components/CompFooter.vue';
</script>

<template>
  <CompTopNav />
  <main>
    <slot />
  </main>
  <CompFooter />
</template>