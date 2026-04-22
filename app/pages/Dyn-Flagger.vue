<!-- PageDyn-Flagger.vue -->
<script setup>
useHead({
  title: "Dyn-Flagger",
  meta: [
    { property: "og:title", content: "Dyn-Flagger" },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: "https://ronroblox-suggestor.pages.dev/Dyn-Flagger",
    },
    { property: "og:image", content: "https://i.imgur.com/NQS7FDH.png" },
    {
      property: "og:description",
      content:
        "A tool to post dynamic/national flags.&#10;Format errors begone.",
    },
  ],
});
</script>

<template>
  <div class="page-wrapper">
    <BContainer class="py-4">
      <BRow class="ron-card">
        <h1 class="text-center">Dyn-Flagger</h1>
      </BRow>

      <BRow class="ron-card mt-4">
        <CompParamsDyn-Flagger />
      </BRow>

      <BRow class="ron-card mt-4 text-center">
        <p>Updates based on the following wiki modules:</p>
        <ul class="list-unstyled">
          <li><NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Lawnames">Module:Lawnames</NuxtLink></li>
          <li><NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Nationdata">Module:Nationdata</NuxtLink></li>
          <li><NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Tagdata">Module:Tagdata</NuxtLink></li>
          <li><NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Flagdata">Module:Flagdata</NuxtLink></li>
        </ul>
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
