import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { elementMap, rarityMap } from './character-data'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  try {
    const rawData = fs.readFileSync(
      path.join(__dirname, '../assets/characters.json'),
      'utf-8'
    )
    const characters = JSON.parse(rawData)

    // 更新现有数据
    for (const char of characters) {
      await prisma.character.update({
        where: { name: char.name },
        data: {
          element: elementMap[char.name] || null,
          rarity: rarityMap[char.name] || null
        }
      })
    }

    console.log('数据更新成功！')
  } catch (error) {
    console.error('数据更新失败：', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 