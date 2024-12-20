import { defineEventHandler } from 'h3'
import { prisma } from '~/server/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  switch (method) {
    case 'GET':
      const query = getQuery(event)
      const page = parseInt(query.page as string) || 1
      const pageSize = parseInt(query.pageSize as string) || 10

      const [items, total] = await Promise.all([
        prisma.character.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { id: 'desc' }
        }),
        prisma.character.count()
      ])

      return {
        items,
        total,
        page,
        pageSize
      }

    case 'POST':
      const createData = await readBody(event)
      return await prisma.character.create({
        data: createData
      })

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
}) 