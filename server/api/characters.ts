import { defineEventHandler } from 'h3'
import { prisma } from '~/server/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const where = {
    AND: [
      // 名称搜索
      query.search ? {
        name: {
          contains: query.search as string
        }
      } : {},
      // 元素筛选
      query.element ? {
        element: query.element as string
      } : {}
    ]
  }

  const characters = await prisma.character.findMany({
    where,
    orderBy: {
      id: 'asc'
    }
  })

  return characters
}) 