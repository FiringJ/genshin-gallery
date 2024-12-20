import { defineEventHandler } from 'h3'
import { prisma } from '~/server/db'

export default defineEventHandler(async (event) => {
  const method = event.method
  const id = parseInt(event.context.params.id)

  switch (method) {
    case 'GET':
      return await prisma.character.findUnique({
        where: { id }
      })

    case 'PUT':
      const updateData = await readBody(event)
      return await prisma.character.update({
        where: { id },
        data: updateData
      })

    case 'DELETE':
      return await prisma.character.delete({
        where: { id }
      })

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
}) 