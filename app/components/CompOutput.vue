<!-- components/CompOutput.vue -->
<script setup lang="ts">
const props = defineProps<{
    /** The text to display and copy. When absent, the slot is shown instead. */
    content?: string;
    showReset?: boolean;
}>()

const emit = defineEmits<{
    (e: 'reset'): void
}>()

const isCopied = ref(false)

async function copyOutput() {
    if (!props.content) return
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 1500)
}

function handleReset() {
    if (confirm('Are you sure you want to reset all fields? This will clear saved data.')) {
        emit('reset')
    }
}
</script>

<template>
    <BCard bg-variant="dark" text-variant="light" class="position-relative mt-4 shadow">
        <div class="position-absolute top-0 end-0 m-3 z-3 d-flex gap-2">
            <BButton
                v-if="showReset"
                variant="outline-danger"
                size="sm"
                class="shadow-sm fw-bold"
                @click="handleReset"
            >
                Reset Form
            </BButton>
            <BButton
                :variant="isCopied ? 'green' : 'primary'"
                :disabled="!content"
                size="sm"
                class="shadow-sm fw-bold"
                @click="copyOutput"
            >
                {{ isCopied ? 'Copied!' : 'Copy to Clipboard' }}
            </BButton>
        </div>

        <pre
            class="mb-0 p-3 text-light"
            style="font-family: 'Roboto Mono', monospace; white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto; tab-size: 4; -moz-tab-size: 4;"
        ><template v-if="content">{{ content }}</template><template v-else><slot /></template></pre>
    </BCard>
</template>