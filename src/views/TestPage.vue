<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果你看到这个页面，说明Vue应用正常工作</p>
    <button @click="count++">点击次数: {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.test-page {
  text-align: center;
  padding: 2rem;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style> 