<!-- CompParamsFormabler.vue -->
<script setup>
    import { computed, ref } from 'vue';

</script>
<template>
    <BCol md="6">
        <BFormGroup label="Formable Name:" class="fw-bold">
            <BFormInput v-model="FormableName" placeholder="Formable Name" />
        </BFormGroup>
    </BCol>
    <BCol md="6">
        <BFormGroup label="Demonym:" class="fw-bold">
            <BFormInput v-model="FormableDemonym" placeholder="Demonym" />
        </BFormGroup>
    </BCol>
    <BCol md="6">
        <BFormGroup label="Flag ID:" class="fw-bold">
            <BFormInput v-model="FormableFlagID" placeholder="Flag ID" />
        </BFormGroup>
    </BCol>
    <!-- Output Component -->
    <CompOutput>Please input the Formable Name and other required fields.</CompOutput>
</template>
