<!-- components/CompFlagImage.vue -->
<script setup lang="ts">
    defineProps<{
        name: string,
        src?: string
    }>()
</script>

<template>
    <img v-if="src" :src="src" alt="" width="24" height="24" class="me-2" style="object-fit: contain;" />
    <div v-else class="placeholder-flag me-2" style="width: 24px; height: 24px; display: inline-block;"></div>
</template>