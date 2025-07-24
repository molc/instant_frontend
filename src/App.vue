<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 暂时不引用settings store，避免循环引用
</script>

<style>
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}
</style> 