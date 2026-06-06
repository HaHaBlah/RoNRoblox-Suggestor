<!-- pages/Releasabler.vue -->
<script setup>
    useHead({
        title: 'Releasabler',
        meta: [
            { property: 'og:title', content: 'Releasabler' },
            { property: 'og:url', content: 'https://ronroblox-suggestor.pages.dev/Releasabler' },
            { property: 'og:description', content: 'A tool to write releasables.' }
        ]
    })
</script>

<template>
    <div class="page-wrapper">
    <BContainer class="py-4">
      <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <h1 class="text-center mb-0">Releasabler</h1>
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <CompParamsReleasabler />
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0 text-center" body-class="p-1 p-sm-4">
        <p>Updates based on the following wiki modules:</p>
        <ul class="list-unstyled mb-0">
          <li>
            <NuxtLink to="https://ronroblox.fandom.com/wiki/Module:Nationdata">Module:Nationdata</NuxtLink>
          </li>
        </ul>
      </BCard>
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