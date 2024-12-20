import { PrismaClient } from '@prisma/client'
import { elementMap, rarityMap } from './character-data'

const prisma = new PrismaClient()

async function checkMissingData() {
  try {
    // 获取所有角色
    const characters = await prisma.character.findMany({
      orderBy: { name: 'asc' }
    })

    console.log('检查缺失的元素和稀有度数据...\n')

    const missing = characters.filter(char =>
      !elementMap[char.name] || !rarityMap[char.name]
    )

    if (missing.length > 0) {
      console.log('以下角色缺少数据：')
      missing.forEach(char => {
        console.log(`${char.name}:`)
        console.log(`  元素: ${elementMap[char.name] || '缺失'}`)
        console.log(`  稀有度: ${rarityMap[char.name] || '缺失'}`)
      })
    } else {
      console.log('所有角色数据完整！')
    }
  } catch (error) {
    console.error('检查失败：', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingData() 