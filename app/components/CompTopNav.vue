<!-- components/CompTopNav.vue -->
<script setup>
  import { ref } from 'vue'

  const isDropdownOpen = ref(false)
</script>

<template>
  <BNavbar toggleable="lg" container="lg">
    <BNavbarBrand to="/">
      <img src="@/assets/images/Logo.png" class="d-inline-block align-top img-logo" alt="Logo" />
      Suggestor
    </BNavbarBrand>

    <BNavbarToggle target="nav-collapse" />

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem to="/">Home</BNavItem>
        <BNavItem to="/Credits">Credits</BNavItem>
        <BNavItem to="/Changelog">Changelog</BNavItem>
        <div @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false" class="d-inline-block">
          <BNavItemDropdown v-model="isDropdownOpen" text="Tools" right>
            <BDropdownItem to="/Formabler">Formabler</BDropdownItem>
            <BDropdownItem to="/Dyn-Flagger">Dyn-Flagger</BDropdownItem>
            <BDropdownItem to="/Cityer">Cityer</BDropdownItem>
            <BDropdownItem to="/Releasabler">Releasabler</BDropdownItem>
            <BDropdownItem to="/Resourcer">Resourcer</BDropdownItem>
          </BNavItemDropdown>
        </div>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style scoped>
  .img-logo {
    width: auto;
    height: 30px;
  }

  /* remove dropdown background */
  :deep(.nav-link.dropdown-toggle) {
    background-color: transparent !important;
    border: none;
  }

  :deep(.nav-link.dropdown-toggle:hover),
  :deep(.nav-link.dropdown-toggle:focus) {
    background-color: transparent !important;
  }
</style>