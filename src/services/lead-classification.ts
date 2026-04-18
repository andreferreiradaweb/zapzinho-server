import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/validatedEnv'
import { prisma } from '@/lib/prisma'

interface PendingClassification {
  userId: string
  messages: string[]
  timer: NodeJS.Timeout
}

const buffer = new Map<string, PendingClassification>()
const WINDOW_MS = 15_000
const MAX_MESSAGES = 3

async function classify(leadId: string, userId: string, messages: string[]) {
  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({ where: { userId } }),
    prisma.product.findMany({ where: { userId }, select: { id: true, title: true } }),
  ])

  if (!categories.length && !products.length) return

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `Você é um assistente de CRM para uma loja no WhatsApp (Brasil).
Analise as mensagens abaixo de um novo cliente e identifique:
1. Qual categoria melhor corresponde ao interesse dele (ou null se nenhuma se encaixar)
2. Qual produto específico ele mencionou ou demonstrou interesse (ou null se nenhum se encaixar)

Mensagens do cliente:
${messages.map(m => `- "${m}"`).join('\n')}

Categorias disponíveis: ${JSON.stringify(categories.map(c => c.name))}
Produtos disponíveis: ${JSON.stringify(products.map(p => p.title))}

Responda APENAS em JSON válido:
{
  "categoryName": "<nome exato de uma das categorias ou null>",
  "productTitle": "<título exato de um dos produtos ou null>"
}`

  const result = await model.generateContent(prompt)
  const parsed = JSON.parse(result.response.text()) as {
    categoryName: string | null
    productTitle: string | null
  }

  const updates: { categoryId?: string; productId?: string } = {}

  if (parsed.categoryName) {
    const match = categories.find(
      c => c.name.toLowerCase() === parsed.categoryName!.toLowerCase(),
    )
    if (match) updates.categoryId = match.id
  }

  if (parsed.productTitle) {
    const match = products.find(
      p => p.title.toLowerCase() === parsed.productTitle!.toLowerCase(),
    )
    if (match) updates.productId = match.id
  }

  if (Object.keys(updates).length > 0) {
    await prisma.lead.update({ where: { id: leadId }, data: updates })
    console.log(`[LeadClassification] Lead ${leadId} atualizado:`, updates)
  }
}

export function addMessage(
  leadId: string,
  userId: string,
  message: string,
  isNew: boolean,
) {
  if (!message.trim()) return

  if (isNew) {
    const timer = setTimeout(() => {
      const entry = buffer.get(leadId)
      if (!entry) return
      buffer.delete(leadId)
      classify(leadId, userId, entry.messages).catch(err =>
        console.error('[LeadClassification] Erro ao classificar lead', leadId, err),
      )
    }, WINDOW_MS)

    buffer.set(leadId, { userId, messages: [message], timer })
    return
  }

  const entry = buffer.get(leadId)
  if (entry && entry.messages.length < MAX_MESSAGES) {
    entry.messages.push(message)
  }
}
