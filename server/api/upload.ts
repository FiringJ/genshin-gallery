import { defineEventHandler } from 'h3'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)
  if (!files?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded'
    })
  }

  const file = files[0]
  const fileName = `${Date.now()}-${file.filename}`
  const filePath = join(process.cwd(), 'public', 'uploads', fileName)

  await writeFile(filePath, file.data)

  return {
    url: `/uploads/${fileName}`
  }
}) 