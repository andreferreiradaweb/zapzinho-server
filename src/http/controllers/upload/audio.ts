import { FastifyRequest, FastifyReply } from 'fastify'
import { uploadToCloudinary } from '@/services/cloudinary'

const MAX_AUDIO_BYTES = 16 * 1024 * 1024 // 16 MB — limite do WhatsApp
const ALLOWED_MIME = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/x-wav']

export async function UploadAudioController(
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
      .send({ message: 'Tipo de arquivo inválido. Envie um áudio (MP3, OGG ou WAV).' })
  }

  const buffer = await data.toBuffer()

  if (buffer.length > MAX_AUDIO_BYTES) {
    return reply.status(400).send({
      message: `Áudio muito grande (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Limite: 16 MB.`,
    })
  }

  // Cloudinary trata arquivos de áudio sob resource_type "video"
  const url = await uploadToCloudinary(buffer, 'video')
  return reply.status(201).send({ url })
}
