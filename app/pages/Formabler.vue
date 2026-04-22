<!-- PageFormabler.vue -->
<script setup>
  useHead({
    title: 'Formabler',
    meta: [
      { property: 'og:title', content: 'Formabler' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://ronroblox-suggestor.pages.dev/Formabler' },
      { property: 'og:image', content: 'https://i.imgur.com/NQS7FDH.png' },
      { property: 'og:description', content: 'A tool to post write formables and missions.&#10;Original by 3meraldk.' }
    ]
  })
</script>

<template>
  <div class="page-wrapper">
    <BContainer class="py-4">
      <BRow class="ron-card">
        <h1 class="text-center">Formabler</h1>
      </BRow>

      <BRow class="ron-card mt-4">
        <CompParamsFormabler />
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
