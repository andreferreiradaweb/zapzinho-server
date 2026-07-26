import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/validatedEnv'

const bodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('product-description'),
    title: z.string(),
    code: z.string().optional(),
    price: z.string().optional(),
    condition: z.string().optional(),
    categoryName: z.string().optional(),
  }),
  z.object({
    type: z.literal('template-message'),
    name: z.string(),
    mediaType: z.enum(['none', 'image', 'video']).optional(),
  }),
  z.object({
    type: z.literal('broadcast-message'),
    broadcastName: z.string(),
    categoryName: z.string().optional(),
    statusFilter: z.string().optional(),
  }),
  z.object({
    type: z.literal('prospecting-warmup'),
    campaignName: z.string(),
    listName: z.string(),
    categories: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('quiz-builder'),
    quizName: z.string(),
    businessDescription: z.string(),
    capturePhone: z.boolean().default(false),
    captureEmail: z.boolean().default(false),
    questionCount: z.number().int().min(2).max(8).default(4),
  }),
])

function buildPrompt(body: z.infer<typeof bodySchema>): string {
  switch (body.type) {
    case 'product-description': {
      const parts = [`Título: ${body.title}`]
      if (body.code) parts.push(`Código: ${body.code}`)
      if (body.price) parts.push(`Preço: ${body.price}`)
      if (body.condition) parts.push(`Condição: ${body.condition}`)
      if (body.categoryName) parts.push(`Categoria: ${body.categoryName}`)
      return `Você é um copywriter especialista em produtos para venda no WhatsApp (Brasil).

Escreva uma descrição atraente para o produto abaixo. A descrição deve:
- Ter no máximo 350 caracteres
- Destacar os principais benefícios e diferenciais
- Usar linguagem direta e persuasiva
- Ser adequada para exibição em catálogo do WhatsApp

${parts.join('\n')}

Responda APENAS com o texto da descrição, sem aspas, sem prefixos, sem explicações.`
    }

    case 'template-message': {
      const mediaHint =
        body.mediaType === 'image'
          ? ' A mensagem será acompanhada de uma imagem.'
          : body.mediaType === 'video'
            ? ' A mensagem será acompanhada de um vídeo.'
            : ''
      return `Você é um especialista em comunicação via WhatsApp no Brasil.

Escreva uma mensagem de template reutilizável para o seguinte contexto:
- Nome do template: ${body.name}${mediaHint}

A mensagem deve:
- Ser natural, como escrita por uma pessoa real
- Ter no máximo 3-4 parágrafos curtos
- Incluir uma saudação, o corpo da mensagem e uma chamada para ação
- Usar linguagem informal e amigável
- Não usar asteriscos nem formatação markdown

Responda APENAS com o texto da mensagem, sem aspas, sem explicações.`
    }

    case 'broadcast-message': {
      const parts = [`Nome do disparo: ${body.broadcastName}`]
      if (body.categoryName) parts.push(`Categoria dos leads: ${body.categoryName}`)
      if (body.statusFilter) parts.push(`Status dos leads: ${body.statusFilter}`)
      return `Você é um especialista em marketing via WhatsApp no Brasil.

Escreva uma mensagem de disparo para leads já cadastrados no CRM. Contexto:
${parts.join('\n')}

A mensagem deve:
- Ser natural e personalizada para o público-alvo
- Ter no máximo 3-4 parágrafos curtos
- Incluir uma chamada para ação clara
- Usar linguagem informal e amigável
- Não usar asteriscos nem formatação markdown

Responda APENAS com o texto da mensagem, sem aspas, sem explicações.`
    }

    case 'prospecting-warmup': {
      const categoriesText = body.categories?.length
        ? body.categories.join(', ')
        : 'variados'
      return `Você é um especialista em prospecção pelo WhatsApp no Brasil.

Escreva uma mensagem de warm-up inicial para prospecção de novos contatos. A mensagem é o primeiro contato, deve parecer humana e NÃO pode ser comercial (para evitar bloqueios).

Contexto:
- Campanha: ${body.campaignName}
- Lista: ${body.listName}
- Categorias dos contatos: ${categoriesText}

A mensagem deve:
- Ser muito curta (1-2 linhas no máximo)
- Ser uma saudação simples e amigável, sem mencionar produto ou empresa
- Parecer uma mensagem casual de pessoa para pessoa
- Pode incluir um emoji leve

Responda APENAS com o texto da mensagem, sem aspas, sem explicações.`
    }

    case 'quiz-builder': {
      const captureLines = ['- Nome (obrigatório)']
      if (body.capturePhone) captureLines.push('- Telefone/WhatsApp')
      if (body.captureEmail) captureLines.push('- E-mail')

      const phoneField = body.capturePhone
        ? `\n  "capturePhoneText": "Qual é o seu WhatsApp?",`
        : ''
      const emailField = body.captureEmail
        ? `\n  "captureEmailText": "Qual é o seu e-mail?",`
        : ''

      return `Você é um especialista em marketing de qualificação de leads no Brasil.

Gere um quiz de qualificação completo com base nas informações abaixo:
- Nome do quiz: ${body.quizName}
- Descrição do negócio/produto: ${body.businessDescription}

O quiz deve capturar os seguintes dados do visitante:
${captureLines.join('\n')}

O quiz deve ter exatamente ${body.questionCount} perguntas de múltipla escolha (type RADIO) que ajudem a qualificar o lead. Cada pergunta deve ter de 2 a 4 opções. Marque isQualifying: true nas opções que indicam que o lead é qualificado para o negócio.

Responda APENAS com um JSON válido neste formato exato, sem markdown, sem backticks, sem nenhum texto adicional:
{
  "welcomeMessage": "mensagem de boas-vindas amigável e contextualizada",
  "captureNameText": "pergunta para capturar o nome",${phoneField}${emailField}
  "questions": [
    {
      "text": "texto da pergunta",
      "options": [
        { "text": "opção qualificada", "isQualifying": true },
        { "text": "opção não qualificada", "isQualifying": false }
      ]
    }
  ],
  "resultQualifiedTitle": "título da tela de qualificado",
  "resultQualifiedMsg": "mensagem para lead qualificado — próximos passos",
  "resultNotQualTitle": "título da tela de não qualificado",
  "resultNotQualMsg": "mensagem gentil para lead não qualificado"
}`
    }
  }
}

export async function generateAiTextController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = bodySchema.parse(request.body)

  if (!env.GEMINI_API_KEY) {
    return reply.status(503).send({ message: 'GEMINI_API_KEY não configurada' })
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(buildPrompt(body))
  const text = result.response.text().trim()

  return reply.status(200).send({ text })
}
