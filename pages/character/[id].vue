<template>
  <div class="character-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="detail-container">
      <!-- 基本信息 -->
      <div class="character-info">
        <h1>{{ character.name }}</h1>
        <div class="character-meta">
          <span class="element">{{ character.element }}</span>
          <span class="rarity">{{ character.rarity }}★</span>
        </div>
      </div>

      <!-- 3D 模型展示区域 -->
      <div class="model-viewer">
        <div v-if="modelLoading" class="loading-progress">
          加载模型中... {{ modelProgress }}%
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: modelProgress + '%' }"></div>
          </div>
        </div>
        <div v-if="modelError" class="error">{{ modelError }}</div>
        <canvas ref="modelCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader'
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const route = useRoute()
const character = ref(null)
const loading = ref(true)
const error = ref(null)
const modelCanvas = ref(null)

// 添加模型加载相关的状态变量
const modelLoading = ref(false)
const modelProgress = ref(0)
const modelError = ref(null)

// Three.js 相关变量
let scene, camera, renderer, controls, model
const helper = new MMDAnimationHelper()

// 初始化3D场景
const initScene = () => {
  scene = new THREE.Scene()

  // 调整相机参数
  camera = new THREE.PerspectiveCamera(
    45,                                         // FOV
    window.innerWidth / window.innerHeight,     // 宽高比
    0.1,                                        // 近平面
    2000                                        // 远平面
  )
  camera.position.set(0, 0, 30)                 // 调整相机位置
  camera.lookAt(0, 0, 0)                        // 相机看向原点

  renderer = new THREE.WebGLRenderer({
    canvas: modelCanvas.value,
    antialias: true,
    alpha: true
  })

  // 设置场景
  renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8)
  renderer.setClearColor(0xffffff, 0)           // 透明背景
  renderer.outputEncoding = THREE.sRGBEncoding  // 改善颜色显示

  // 增强光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)  // 增加环境光强度
  scene.add(ambientLight)

  // 添加多个方向光以改善光照效果
  const frontLight = new THREE.DirectionalLight(0xffffff, 1)
  frontLight.position.set(0, 0, 10)
  scene.add(frontLight)

  const topLight = new THREE.DirectionalLight(0xffffff, 0.8)
  topLight.position.set(0, 10, 0)
  scene.add(topLight)

  const sideLight = new THREE.DirectionalLight(0xffffff, 0.5)
  sideLight.position.set(10, 0, 0)
  scene.add(sideLight)

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true                 // 添加阻尼效果
  controls.dampingFactor = 0.05
  controls.minDistance = 5
  controls.maxDistance = 50
  controls.target.set(0, 0, 0)                 // 控制器目标点设为原点

  // 加载模型
  loadMMDModel()

  // 动画循环
  animate()
}

// 加载 MMD 模型
const loadMMDModel = () => {
  modelLoading.value = true
  modelError.value = null

  const loader = new MMDLoader()

  try {
    const modelName = character.value.name.replace(/[（）]/g, '')
    const modelPath = `/models/${character.value.name}/${modelName}.pmx`
    console.log('尝试加载模型:', modelPath)

    loader.load(
      modelPath,
      (mesh) => {
        model = mesh

        // 自动调整模型位置
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)              // 将模型移动到场景中心
        model.position.y -= 5                   // 稍微下移

        // 调整模型大小
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const targetHeight = 25                 // 目标高度
        const scale = targetHeight / size.y     // 根据高度计算缩放比例
        model.scale.set(scale, scale, scale)    // 统一缩放以保持比例

        scene.add(model)
        modelLoading.value = false
        console.log('模型加载成功')

        // 自动调整相机位置
        const fov = camera.fov * (Math.PI / 180)
        let cameraZ = Math.abs(maxDim / Math.tan(fov / 2))
        camera.position.z = cameraZ * 1.2       // 留出一些边距
        camera.updateProjectionMatrix()

        // 更新控制器
        controls.target.copy(new THREE.Vector3(0, 0, 0))
        controls.update()
      },
      (xhr) => {
        modelProgress.value = Math.floor((xhr.loaded / xhr.total) * 100)
        console.log(`模型加载进度: ${modelProgress.value}%`)
      },
      (error) => {
        console.error('模型加载失败:', error)
        modelError.value = '模型加载失败，请检查模型文件是否存在'
        modelLoading.value = false
      }
    )
  } catch (err) {
    console.error('模型加载初始化失败:', err)
    modelError.value = '模型加载初始化失败'
    modelLoading.value = false
  }
}

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)

  if (helper) {
    helper.update(1000 / 60) // 60fps
  }

  controls.update()
  renderer.render(scene, camera)
}

// 获取角色数据
const fetchCharacterDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/characters/${route.params.id}`)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '获取角色数据失败')
    }
    character.value = await response.json()
  } catch (err) {
    console.error('Failed to fetch character:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8)
  }
}

// 生命周期钩子
onMounted(async () => {
  await fetchCharacterDetail()
  if (character.value && !error.value) {
    initScene()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.character-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.character-info {
  text-align: center;
}

.character-meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.model-viewer {
  width: 100%;
  height: 80vh;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #ff4444;
}

/* 添加进度条样式 */
.loading-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin: 10px auto;
}

.progress-bar-fill {
  height: 100%;
  background: #4CAF50;
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>