<!-- pages/Formabler.vue -->
<script setup>
  useHead({
    title: 'Formabler',
    meta: [
      { property: 'og:title', content: 'Formabler' },
      { property: 'og:url', content: 'https://ronroblox-suggestor.pages.dev/Formabler' },
      { property: 'og:description', content: 'A tool to write formables and missions.\nOriginal by 3meraldk.' }
    ]
  })
</script>

<template>
  <div class="page-wrapper">
    <BContainer class="py-4">
      <div class="ron-card">
        <h1 class="text-center">Formabler</h1>
      </div>

      <div class="ron-card mt-4">
        <CompParamsFormabler />
      </div>

      <div class="ron-card mt-4 text-center">
        <p>
          <NuxtLink to="https://3meraldk.github.io/ron-formabler/">Original</NuxtLink> by 3meraldk.
        </p>
        <p>Updates based on the following wiki modules:</p>
        <ul class="list-unstyled">
          <li>
            <NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Lawnames">Module:Lawnames</NuxtLink>
          </li>
          <li>
            <NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Nationdata">Module:Nationdata</NuxtLink>
          </li>
          <li>
            <NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Tagdata">Module:Tagdata</NuxtLink>
          </li>
          <li>
            <NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Flagdata">Module:Flagdata</NuxtLink>
          </li>
        </ul>
      </div>
    </BContainer>
  </div>
</template>

<style scoped>
  .page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-image: url("@/assets/images/AllFlags.jpg");
    background-repeat: repeat;
    background-size: auto;
  }
</style>