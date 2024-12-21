import { defineEventHandler } from 'h3'
import { prisma } from '~/server/db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: '无效的角色ID'
    })
  }

  const character = await prisma.character.findUnique({
    where: { id }
  })

  if (!character) {
    throw createError({
      statusCode: 404,
      message: '角色不存在'
    })
  }

  return character
}) 