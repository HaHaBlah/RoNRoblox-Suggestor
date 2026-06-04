<!-- pages/Dyn-Flagger.vue -->
<script setup>
  useHead({
    title: "Dyn-Flagger",
    meta: [
      { property: "og:title", content: "Dyn-Flagger" },
      {
        property: "og:url",
        content: "https://ronroblox-suggestor.pages.dev/Dyn-Flagger",
      },
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
      <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <h1 class="text-center mb-0">Dyn-Flagger</h1>
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <CompParamsDyn-Flagger />
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0 text-center" body-class="p-1 p-sm-4">
        <p>Updates based on the following wiki modules:</p>
        <ul class="list-unstyled mb-0">
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