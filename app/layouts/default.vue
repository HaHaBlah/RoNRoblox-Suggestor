<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <CompTopNav />
    <main>
      <slot />
    </main>
    <CompFooter />
  </div>
</template>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;        /* to have main fill the space between content and  footer */
  display: flex;
  flex-direction: column;
}
</style>