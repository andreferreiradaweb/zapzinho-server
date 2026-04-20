import { FastifyRequest, FastifyReply } from 'fastify'
import { uploadToCloudinary } from '@/services/cloudinary'

const MAX_VIDEO_BYTES = 16 * 1024 * 1024 // 16 MB — limite do WhatsApp
const ALLOWED_MIME = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']

export async function UploadVideoController(
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
      .send({ message: 'Tipo de arquivo inválido. Envie um vídeo (MP4, MOV, AVI ou WebM).' })
  }

  const buffer = await data.toBuffer()

  if (buffer.length > MAX_VIDEO_BYTES) {
    return reply.status(400).send({
      message: `Vídeo muito grande (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Limite: 16 MB (máximo suportado pelo WhatsApp).`,
    })
  }

  const url = await uploadToCloudinary(buffer, 'video')
  return reply.status(201).send({ url })
}
