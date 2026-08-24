import { FastifyRequest, FastifyReply } from 'fastify'
import { uploadToCloudinary } from '@/services/cloudinary'

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024 // 15 MB
const ALLOWED_MIME = ['application/pdf']

export async function UploadDocumentController(
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
      .send({ message: 'Tipo de arquivo inválido. Envie um PDF.' })
  }

  const buffer = await data.toBuffer()

  if (buffer.length > MAX_DOCUMENT_BYTES) {
    return reply.status(400).send({
      message: `Arquivo muito grande (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Limite: 15 MB.`,
    })
  }

  const url = await uploadToCloudinary(buffer, 'raw')
  return reply.status(201).send({ url })
}
