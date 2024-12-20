<template>
  <div class="character-gallery">
    <!-- 筛选器区域 -->
    <div class="filters">
      <div class="filter-group">
        <label>元素筛选：</label>
        <select v-model="selectedElement">
          <option value="">全部</option>
          <option v-for="element in elements" :key="element" :value="element">
            {{ element }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>稀有度：</label>
        <select v-model="selectedRarity">
          <option value="">全部</option>
          <option value="4">4星</option>
          <option value="5">5星</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="gallery-grid">
      <div v-for="character in filteredCharacters" :key="character.id" class="character-card"
        @click="handleCharacterClick(character)">
        <img :src="character.imageUrl" :alt="character.name" @error="handleImageError">
        <div class="character-info">
          <div class="character-name">{{ character.name }}</div>
          <div class="character-details">
            <span class="element">{{ character.element }}</span>
            <span class="rarity">{{ character.rarity }}★</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const characters = ref([])
const loading = ref(false)
const error = ref(null)
const selectedElement = ref('')
const selectedRarity = ref('')

// 元素类型列表
const elements = ['火', '水', '冰', '雷', '风', '岩', '草']

// 过滤后的角色列表
const filteredCharacters = computed(() => {
  return characters.value.filter(char => {
    const elementMatch = !selectedElement.value || char.element === selectedElement.value
    const rarityMatch = !selectedRarity.value || char.rarity === Number(selectedRarity.value)
    return elementMatch && rarityMatch
  })
})

// 获取角色数据
const fetchCharacters = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/characters')
    if (!response.ok) {
      throw new Error('获取数据失败')
    }
    characters.value = await response.json()
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    error.value = '加载角色数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = '/placeholder.png'
}

// 处理角色点击
const handleCharacterClick = (character) => {
  window.open(character.detailUrl, '_blank')
}

onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.character-gallery {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff4444;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  justify-items: center;
}

.character-card {
  width: 120px;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.character-card:hover {
  transform: translateY(-5px);
}

.character-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.character-info {
  padding: 8px 0;
}

.character-name {
  text-align: center;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.character-details {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
}

.element {
  color: #666;
}

.rarity {
  color: #ffa500;
}
</style>