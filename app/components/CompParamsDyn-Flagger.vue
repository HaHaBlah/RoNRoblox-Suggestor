<!-- CompParamsDyn-Flagger.vue -->
<script setup lang="ts">
  import { ref } from "vue";

  import CompNationsListSelector from "./CompNationsList.vue";

  // Sidebar START
  const tocVisible = ref(false);

  // This example uses buttons to show the hidden sidebars, but you could also use a menu item or any other
  //  UX element that can change the state of the model value for the BOffcanvas
  const showToc = () => {
    tocVisible.value = true;
  };

  const tocGenerator = (s: string, c: number): string[] =>
    [...Array(c).keys()].map((i) => `${s} ${i}`);

  const toc = tocGenerator("Chapter", 50); // Replace this with your own table of contents
  // Sidebar END


  // Params START
  const nationName = ref("");
  const flagImageUrl = ref("Unknown Flag.png"); // Placeholder image URL
  const flagData = ref(null);
  // Params END

  // Output START
  const myCode = computed(() => {
    return `-- Generated for ${nationName.value || 'Unknown Nation'}
local flag = "flag_id_here"
print("Glory to " .. "${nationName.value}")`;
  });

  // We wrap it so the UI shows the backticks for the user to copy
  const generatedCode = computed(() => {
    return `\`\`\`text\n\`\`\`lua\n${myCode.value}\n\`\`\`\n\`\`\``;
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // If using Nuxt UI, you can use useToast() here
      console.log("Copied!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };
  // Output END
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
          <CompNationsListSelector />
        </BOffcanvas>
      </BCol>
      <!-- Params -->
      <BCol md="10">
        <BForm>
          <!-- Nationname and Flag Image -->
          <NuxtImg src="Unknown Flag.png" alt="Placeholder Image" class="mb-3 nav-justified" />
          <BFormInput type="text" placeholder="Enter the Nation Name" v-model="nationName" />
          <!-- Params -->


        </BForm>
        <!-- Output -->
        <div class="card bg-dark text-light border-0">
          <div class="card-header d-flex justify-content-between align-items-center py-2 border-secondary">
            <small class="text-secondary text-uppercase fw-bold">Code Snippet</small>
            <BButton variant="outline-light" size="sm" @click="copyToClipboard(myCode)">Copy</BButton>
          </div>

          <div class="card-body p-0">
            <pre class="m-0 p-3"><code class="text-info">{{ generatedCode }}</code></pre>
          </div>
        </div>
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


  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 400px;
    overflow-y: auto;
  }

  code {
    font-family: 'Courier New', Courier, monospace;
  }
</style>
