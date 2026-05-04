<!-- components/CompOutput.vue -->
<script setup lang="ts">
    import { useDynFlagger } from '~/composables/useDynFlagger'
    import type { FlagSpec } from '~/composables/useDynFlagger'

    const { state } = useDynFlagger()
    const ITEMS_PER_IMAGE_ROW = 3
    const TAB = '    '

    const thumbnailCache = reactive<Record<string, string | null>>({})

    async function fetchThumbnail(flagId: string): Promise<string | null> {
        if (flagId in thumbnailCache) return thumbnailCache[flagId]
        try {
            const data = await $fetch<{ imageUrl: string }>(`/api/roblox-thumbnail?assetid=${encodeURIComponent(flagId)}&size=700x700`)
            thumbnailCache[flagId] = data.imageUrl
        } catch {
            thumbnailCache[flagId] = null
        }
        return thumbnailCache[flagId]
    }

    function buildSingleFlag(flag: FlagSpec): string {
        const id = flag.FlagID ? `rbxassetid://${flag.FlagID}` : ''
        const name = flag.FlagName ?? ''
        const hasIdeologies = flag.Ideologies?.length > 0
        const hasLaws = Object.keys(flag.Laws ?? {}).length > 0
        const hasNOTLaws = Object.keys(flag.NOTLaws ?? {}).length > 0

        if (!hasIdeologies && !hasLaws && !hasNOTLaws) {
            return `${TAB}["${name}"] = {ID = "${id}",},`
        }

        const lines = [`${TAB}["${name}"] = {ID = "${id}",`, `${TAB}${TAB}Requirements = {`]
        if (hasIdeologies) lines.push(`${TAB}${TAB}${TAB}${TAB}["Ideology"] = '[${flag.Ideologies.map(i => `"${i}"`).join(', ')}]',`)
        if (hasLaws) lines.push(`${TAB}${TAB}${TAB}${TAB}["Political_Law"] = '${JSON.stringify(flag.Laws)}',`)
        if (hasNOTLaws) lines.push(`${TAB}${TAB}${TAB}${TAB}["NOT_Political_Law"] = '${JSON.stringify(flag.NOTLaws)}',`)
        lines.push(`${TAB}${TAB}},`, `${TAB}},`)
        return lines.join('\n')
    }

    function chunk<T>(arr: T[], size: number): T[][] {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))
    }

    const luaCode = computed(() => {
        const validFlags = state.Flags.filter(f => f.FlagName && f.FlagID)
        if (!validFlags.length || !state.NationName) return ''
        return `["${state.NationName}"] = {\n${validFlags.map(buildSingleFlag).join('\n')}\n},`
    })

    const imageLinks = ref<string[]>([])

    watch(
        () => state.Flags.filter(f => f.FlagName && f.FlagID),
        async (validFlags) => {
            const urls = await Promise.all(validFlags.map(f => fetchThumbnail(f.FlagID)))
            imageLinks.value = validFlags.map((f, i) => (urls[i] ? `[${f.FlagName}](${urls[i]})` : null)).filter((x): x is string => Boolean(x))
        },
        { deep: true, immediate: true },
    )

    const outputText = computed(() => {
        if (!luaCode.value) return 'Please input the Nation Name and fill out all flag names and image IDs.'
        const descriptions = state.Flags.filter(f => f.Description).map(f => `**${f.FlagName}:** ${f.Description}`).join('\n')
        const imagesBlock = chunk(imageLinks.value, ITEMS_PER_IMAGE_ROW).map(row => row.join(', ')).join('\n')

        return [
            '```lua', luaCode.value, '```', '--[[', '# __Description/Sources__', descriptions, '# __Images__', imagesBlock, '> -# *Made using [Dyn-Flagger](https://ronroblox-suggestor.pages.dev/Dyn-Flagger/ )*', ']]',
        ].join('\n')
    })

    const isCopied = ref(false)
    async function copyOutput() {
        await navigator.clipboard.writeText(outputText.value)
        isCopied.value = true
        setTimeout(() => { isCopied.value = false }, 1500)
    }
</script>

<template>
    <BCard bg-variant="dark" text-variant="light" class="position-relative mt-4 shadow">
        <BButton :variant="isCopied ? 'success' : 'primary'" size="sm"
            class="position-absolute top-0 end-0 m-3 z-3 shadow-sm fw-bold" @click="copyOutput">
            {{ isCopied ? 'Copied!' : 'Copy to Clipboard' }}
        </BButton>

        <pre class="mb-0 p-3 text-light"
            style="font-family: 'Roboto Mono', monospace; white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ outputText }}</pre>
    </BCard>
</template>