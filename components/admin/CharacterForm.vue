<template>
  <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100"
    require-mark-placement="right-hanging">
    <n-form-item label="角色名称" path="name">
      <n-input v-model:value="formData.name" placeholder="请输入角色名称" />
    </n-form-item>

    <n-form-item label="元素属性" path="element">
      <n-select v-model:value="formData.element" :options="elementOptions" placeholder="请选择元素属性" />
    </n-form-item>

    <n-form-item label="稀有度" path="rarity">
      <n-input-number v-model:value="formData.rarity" :min="4" :max="5" />
    </n-form-item>

    <n-form-item label="角色图片" path="imageUrl">
      <n-upload v-model:file-list="fileList" :custom-request="handleUpload" :max="1">
        <n-button>上传图片</n-button>
      </n-upload>
    </n-form-item>

    <n-form-item label="详情链接" path="detailUrl">
      <n-input v-model:value="formData.detailUrl" placeholder="��输入详情页链接" />
    </n-form-item>

    <div class="form-actions">
      <n-button @click="handleCancel">取消</n-button>
      <n-button type="primary" @click="handleSubmit">提交</n-button>
    </div>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInst } from 'naive-ui'

const props = defineProps<{
  character?: any
}>()

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref<FormInst | null>(null)
const fileList = ref([])

const formData = reactive({
  name: props.character?.name ?? '',
  element: props.character?.element ?? '',
  rarity: props.character?.rarity ?? 4,
  imageUrl: props.character?.imageUrl ?? '',
  detailUrl: props.character?.detailUrl ?? ''
})

const elementOptions = [
  { label: '火', value: 'pyro' },
  { label: '水', value: 'hydro' },
  { label: '风', value: 'anemo' },
  { label: '雷', value: 'electro' },
  { label: '草', value: 'dendro' },
  { label: '冰', value: 'cryo' },
  { label: '岩', value: 'geo' }
]

const rules = {
  name: {
    required: true,
    message: '请输入角色名称',
    trigger: 'blur'
  },
  element: {
    required: true,
    message: '请选择元素属性',
    trigger: 'change'
  }
}

const handleSubmit = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      emit('submit', formData)
    }
  })
}

const handleCancel = () => {
  emit('cancel')
}

const handleUpload = async ({ file }: { file: File }) => {
  // 实现文件上传逻辑
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    formData.imageUrl = data.url
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>