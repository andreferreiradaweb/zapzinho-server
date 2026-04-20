import { FastifyRequest, FastifyReply } from 'fastify'
import { uploadToCloudinary } from '@/services/cloudinary'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB bruto (frontend já comprime para ~500KB)
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function UploadImageController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await request.file()

  if (!data) {
    return reply.status(400).send({ message: 'Nenhum arquivo enviado.' })
  }

  if (!ALLOWED_MIME.includes(data.mimetype)) {
    return reply
      .status(400)
      .send({ message: 'Tipo de arquivo inválido. Envie uma imagem (JPEG, PNG, WebP ou GIF).' })
  }

  const buffer = await data.toBuffer()

  if (buffer.length > MAX_IMAGE_BYTES) {
    return reply.status(400).send({
      message: `Imagem muito grande (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Limite: 10 MB.`,
    })
  }

  const url = await uploadToCloudinary(buffer, 'image')
  return reply.status(201).send({ url })
}
