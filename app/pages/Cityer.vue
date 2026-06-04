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
      <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <h1 class="text-center mb-0">Cityer</h1>
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <CompParamsCityer />
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0 text-center" body-class="p-1 p-sm-4">
        <p class="mb-0">Powered by <NuxtLink to="https://docs.mapbox.com/mapbox-gl-js/api/" class="text-body"
            target="_blank">Mapbox GL JS</NuxtLink>
        </p>
      </BCard>
    </BContainer>
  </div>
</template>

<style scoped>
  .page-wrapper {
    flex: 1;
    /* fills space between header and footer */
    display: flex;
    flex-direction: column;
    background-image: url("@/assets/images/AllFlags.jpg");
    background-repeat: repeat;
    background-size: auto;
  }
</style>