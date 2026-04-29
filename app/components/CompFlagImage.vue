<!-- components/CompFlagImage.vue -->
<script setup lang="ts">
    const props = defineProps<{ name: string }>()
    const { getUrl } = useFlagUrl()

    const src = ref('')
    onMounted(async () => { src.value = await getUrl(props.name) })
    watch(() => props.name, async (name) => { src.value = await getUrl(name) })
</script>

<template>
    <img :src="src || undefined" :alt="`${name} flag`" width="24" height="24" class="me-2"
        style="object-fit: contain;" />
</template>