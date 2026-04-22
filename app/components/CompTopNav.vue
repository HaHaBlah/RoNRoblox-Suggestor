<!-- CompTopNav.vue -->
<script setup></script>

<template>
  <BNavbar
    toggleable="lg"
    container="lg"
  >
    <BNavbarBrand to="/">
      <img
        src="@/assets/images/Logo.png"
        class="d-inline-block align-top img-logo"
        alt="Logo"
      />
      Suggestor
    </BNavbarBrand>

    <BNavbarToggle target="nav-collapse" />

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

<style scoped>
.img-logo {
  width: auto;
  height: 30px;
}
</style>
