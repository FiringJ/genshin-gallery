<template>
  <div class="container">
    <h1>原神角色图鉴</h1>
    <CharacterGallery />
  </div>
</template>

<script setup>
import CharacterGallery from '@/components/CharacterGallery.vue'
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}
</style>