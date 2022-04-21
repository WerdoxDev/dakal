<template>
  <div class="bg-gray-100 text-sm md:text-base overflow-auto h-full no-highlight relative user pointer-events-auto" dir="rtl">
    <BaseNavbar />
    <router-view />
    <div
      class="hidden text-rose-500 bg-rose-300 bg-rose-500 text-emerald-500 bg-emerald-300 bg-emerald-500 border-t-emerald-600 border-t-rose-600 border-t-blue-600"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import BaseNavbar from "./components/BaseNavbar.vue";

export default defineComponent({
  components: {
    BaseNavbar,
  },
});
</script>

<style>
@font-face {
  font-family: "Mikhak";
  src: url("./fonts/mikhak/Mikhak-Medium.ttf");
}
@font-face {
  font-family: "Estedad";
  src: url("./fonts/estedad/Estedad-Medium.ttf");
}

#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply absolute inset-0;
}
</style>
