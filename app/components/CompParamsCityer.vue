<!-- components/CompParamsCityer.vue -->
<script setup>
import { useCityer } from '@/composables/CityerOutput'

const { formattedOutput } = useCityer()
</script>

<template>
    <CompInteractiveMap />

    <CompOutput :content="formattedOutput">
        Please click on the map, fill in the city details, and click "Save City" to begin.
    </CompOutput>
</template>