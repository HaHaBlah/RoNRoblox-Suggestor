<!-- index.vue -->
<script setup>
  import CompFooter from '@/components/CompFooter.vue';
  import CompTopNav from '@/components/CompTopNav.vue';

  useHead({
    title: 'Suggestor',
    meta: [
      { name: 'Suggestor', content: 'Tools for the Rise of Nations suggestions community.', },
      { name: 'og:title', content: 'Suggestor' },
      { name: 'og:description', content: 'Tools for the Rise of Nations suggestions community.', },
      { name: 'og:image', content: 'https://i.imgur.com/NQS7FDH.png' },
      { name: 'og:url', content: 'https://ronroblox-suggestor.pages.dev' },
    ],
  });
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <ul>
          <li>
            <RouterLink to="/Credits">Credits</RouterLink>
          </li>
          <li>
            <RouterLink to="/Formabler">Formabler</RouterLink>
          </li>
          <li>
            <RouterLink to="/Dyn-Flagger">Dyn-Flagger</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
