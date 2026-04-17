<!-- CompTopNav.vue -->
<script setup></script>

<template>
  <BNavbar toggleable="lg" variant="dark" v-b-color-mode="'dark'">
    <BNavbarBrand to="/">RoN Roblox Suggestor</BNavbarBrand>

    <BNavbarToggle class="ms-auto" target="nav-collapse" />

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem to="/">Home</BNavItem>
        <BNavItem to="/Credits">Credits</BNavItem>
        <BNavItem to="/Formabler">Formabler</BNavItem>
        <BNavItem to="/Dyn-Flagger">Dyn-Flagger</BNavItem>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style scoped></style>
