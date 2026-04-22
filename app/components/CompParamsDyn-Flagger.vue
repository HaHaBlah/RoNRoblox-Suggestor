<!-- CompParamsDyn-Flagger.vue -->
<script setup lang="ts">
  import { ref } from "vue";

  const tocVisible = ref(false);

  // This example uses buttons to show the hidden sidebars, but you could also use a menu item or any other
  //  UX element that can change the state of the model value for the BOffcanvas
  const showToc = () => {
    tocVisible.value = true;
  };

  const tocGenerator = (s: string, c: number): string[] =>
    [...Array(c).keys()].map((i) => `${s} ${i}`);

  const toc = tocGenerator("Chapter", 100); // Replace this with your own table of contents
</script>

<template>
  <BContainer fluid="xxl">

    <!-- Mobile Toggle Sidebar Button -->
    <BRow class="d-md-none">
      <BCol>
        <BButton variant="link" underline-opacity="0" aria-controls="offcanvas-toc"
          :aria-expanded="tocVisible ? 'true' : 'false'" @click="showToc">&lt; Table of Contents</BButton>
      </BCol>
    </BRow>
    <BRow>
      <!-- Sidebar -->
      <BCol md="2" class="scrollable-column">
        <BOffcanvas id="offcanvas-toc" v-model="tocVisible" title="Table of Contents" placement="start" responsive="md">
          <ul>
            <ul>
              <li v-for="item in toc" :key="item">
                {{ item }}
              </li>
              <li>A very large entry in table of contents</li>
            </ul>
          </ul>
        </BOffcanvas>
      </BCol>
      <!-- Params -->
      <BCol md="10">
        <BForm>
          
        </BForm>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped lang="scss">

  // The styling below makes a colum scroll independently of the rest of the page if
  //  its content is too large to fit in the current viewport
  .scrollable-column {
    max-height: 100vh;
    overflow-y: auto;
    position: sticky;
    top: 0;
  }
</style>
