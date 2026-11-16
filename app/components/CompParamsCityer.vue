<!-- components/CompParamsCityer.vue -->
<script setup>
import { useCityer } from '@/composables/CityerOutput'

const { formattedOutput, cities, clearCities } = useCityer()
</script>

<template>
    <CompInteractiveMap />

    <CompOutput :content="formattedOutput" :showReset="cities.length > 0" @reset="clearCities">
        Please click on the map, fill in the city details, and click "Save City" to begin.
    </CompOutput>
</template>