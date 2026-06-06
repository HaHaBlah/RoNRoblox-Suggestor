<!-- pages/Resourcer.vue -->
<script setup>
  useHead({
    title: "Resourcer",
    meta: [
      { property: "og:title", content: "Resourcer" },
      {
        property: "og:url",
        content: "https://ronroblox-suggestor.pages.dev/Resourcer",
      },
      {
        property: "og:description",
        content:
          "A tool to post RoN resources.",
      },
    ],
  });
</script>
<template>
  <div class="page-wrapper">
    <BContainer class="py-4">
      <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <h1 class="text-center mb-0">Resourcer</h1>
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <CompParamsResourcer />
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
    /* fills space between header and footer */
    display: flex;
    flex-direction: column;
    background-image: url("@/assets/images/RoNMap SEAsia.png");
    background-repeat: no-repeat;
    background-size: cover;
  }
</style>