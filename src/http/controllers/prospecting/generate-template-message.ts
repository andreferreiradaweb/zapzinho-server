import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/validatedEnv'

const bodySchema = z.object({
  campaignName: z.string(),
  warmupMessage: z.string(),
  listName: z.string(),
  categories: z.array(z.string()).optional(),
})

export async function generateTemplateMessageController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { campaignName, warmupMessage, listName, categories } =
    bodySchema.parse(request.body)

  if (!env.GEMINI_API_KEY) {
    return reply.status(503).send({ message: 'GEMINI_API_KEY não configurada' })
  }

  const categoriesText = categories?.length ? categories.join(', ') : 'variados'

  const prompt = `Você é um especialista em prospecção pelo WhatsApp no Brasil.

Contexto da campanha:
- Nome da campanha: ${campaignName}
- Lista de contatos: ${listName}
- Categorias dos contatos: ${categoriesText}
- Mensagem de warm-up enviada antes: "${warmupMessage}"

Escreva uma mensagem de template de prospecção para WhatsApp. Ela será enviada automaticamente quando o contato responder ao warm-up. A mensagem deve:
- Ser natural, como se fosse escrita por uma pessoa real
- Se apresentar brevemente e mencionar o produto ou serviço relacionado ao contexto
- Ter no máximo 3-4 parágrafos curtos
- Incluir uma chamada para ação clara no final
- Usar linguagem informal e amigável (Brasil)
- Não usar asteriscos nem formatação markdown

Responda APENAS com o texto da mensagem, sem aspas, sem explicações adicionais.`

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(prompt)
  const templateMessage = result.response.text().trim()

  return reply.status(200).send({ templateMessage })
}
