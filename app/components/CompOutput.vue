<!-- components/CompOutput.vue -->
<script setup lang="ts">
const props = defineProps<{
    /** The text to display and copy. When absent, the slot is shown instead. */
    content?: string
}>()

const isCopied = ref(false)

async function copyOutput() {
    if (!props.content) return
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 1500)
}
</script>

<template>
    <BCard bg-variant="dark" text-variant="light" class="position-relative mt-4 shadow">
        <BButton
            :variant="isCopied ? 'green' : 'primary'"
            :disabled="!content"
            size="sm"
            class="position-absolute top-0 end-0 m-3 z-3 shadow-sm fw-bold"
            @click="copyOutput"
        >
            {{ isCopied ? 'Copied!' : 'Copy to Clipboard' }}
        </BButton>

        <pre
            class="mb-0 p-3 text-light"
            style="font-family: 'Roboto Mono', monospace; white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto;"
        ><template v-if="content">{{ content }}</template><template v-else><slot /></template></pre>
    </BCard>
</template>