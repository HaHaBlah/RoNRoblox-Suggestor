<!-- pages/Cityer.vue -->
<script setup>
    useHead({
        title: "Cityer",
        meta: [
            { property: "og:title", content: "Cityer" },
            { property: "og:type", content: "website" },
            {
                property: "og:url",
                content: "https://ronroblox-suggestor.pages.dev/Cityer",
            },
            {
                property: "og:description",
                content:
                    "A tool to post RoN cities.&#10;Has a map.",
            },
        ],
    });
</script>

<template>
  <div class="page-wrapper">
    <BContainer class="py-4">
      <BRow class="ron-card">
        <h1 class="text-center">Cityer</h1>
      </BRow>

      <BRow class="ron-card mt-4">
        <CompParamsCityer />
      </BRow>

      <BRow class="ron-card mt-4 text-center">
        <p>Powered by <NuxtLink to="https://docs.mapbox.com/mapbox-gl-js/api/" class="text-body" target="_blank">Mapbox GL JS</NuxtLink></p>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.page-wrapper {
  flex: 1; /* fills space between header and footer */
  display: flex;
  flex-direction: column;
  background-image: url("@/assets/images/AllFlags.jpg");
  background-repeat: repeat;
  background-size: auto;
}
</style>
