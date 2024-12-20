<template>
  <n-layout>
    <n-layout-header>
      <div class="admin-header">
        <h1>角色管理系统</h1>
      </div>
    </n-layout-header>

    <n-layout-content>
      <div class="admin-content">
        <div class="actions">
          <n-button type="primary" @click="showForm = true">
            添加角色
          </n-button>
        </div>

        <n-data-table :columns="columns" :data="characters" :loading="loading" :pagination="pagination"
          @update:page="handlePageChange" />

        <n-modal v-model:show="showForm" preset="card" title="角色信息">
          <CharacterForm :character="editingCharacter" @submit="handleSubmit" @cancel="handleCancel" />
        </n-modal>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DataTableColumns } from 'naive-ui'

const showForm = ref(false)
const loading = ref(false)
const characters = ref([])
const editingCharacter = ref(null)

const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0
})

const columns: DataTableColumns = [
  { title: 'ID', key: 'id' },
  { title: '名称', key: 'name' },
  { title: '元素', key: 'element' },
  { title: '稀有度', key: 'rarity' },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h('div', { class: 'table-actions' }, [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => handleEdit(row)
          },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row.id)
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

const fetchCharacters = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/admin/characters?page=${pagination.value.page}&pageSize=${pagination.value.pageSize}`)
    const data = await response.json()
    characters.value = data.items
    pagination.value.itemCount = data.total
  } catch (error) {
    console.error('Failed to fetch characters:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (formData: any) => {
  try {
    const url = editingCharacter.value
      ? `/api/admin/characters/${editingCharacter.value.id}`
      : '/api/admin/characters'

    const method = editingCharacter.value ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    showForm.value = false
    editingCharacter.value = null
    await fetchCharacters()
  } catch (error) {
    console.error('Failed to save character:', error)
  }
}

const handleEdit = (character: any) => {
  editingCharacter.value = character
  showForm.value = true
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这个角色吗？')) {
    try {
      await fetch(`/api/admin/characters/${id}`, {
        method: 'DELETE'
      })
      await fetchCharacters()
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }
}

const handleCancel = () => {
  showForm.value = false
  editingCharacter.value = null
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchCharacters()
}

onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.admin-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.admin-content {
  padding: 24px;
}

.actions {
  margin-bottom: 24px;
}

.table-actions {
  display: flex;
  gap: 8px;
}
</style>