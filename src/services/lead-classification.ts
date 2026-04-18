import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/validatedEnv'
import { prisma } from '@/lib/prisma'

interface PendingClassification {
  userId: string
  messages: string[]
  timer: NodeJS.Timeout
}

const buffer = new Map<string, PendingClassification>()
const WINDOW_MS = 30_000
const MAX_MESSAGES = 3

const tag = '[LeadClassification]'

async function classify(leadId: string, userId: string, messages: string[]) {
  console.log(`${tag} ⏱ Timer disparado — lead=${leadId} mensagens=${JSON.stringify(messages)}`)

  if (!env.GEMINI_API_KEY) {
    console.warn(`${tag} ❌ GEMINI_API_KEY não configurada — abortando`)
    return
  }

  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({ where: { userId } }),
    prisma.product.findMany({ where: { userId }, select: { id: true, title: true } }),
  ])

  console.log(`${tag} 📦 userId=${userId} categorias=${categories.map(c => c.name).join(', ') || '(nenhuma)'} produtos=${products.map(p => p.title).join(', ') || '(nenhum)'}`)

  if (!categories.length && !products.length) {
    console.warn(`${tag} ⚠️ Nenhuma categoria nem produto cadastrado — pulando classificação`)
    return
  }

  const prompt = `Você é um assistente de CRM para uma loja no WhatsApp (Brasil).
Analise as mensagens abaixo de um novo cliente e responda:

1. CATEGORIA: qual categoria melhor representa o interesse geral do cliente (ou null se nenhuma se encaixar).
2. PRODUTO: somente retorne um produto se o cliente mencionou explicitamente um produto específico pelo nome ou código. Se o cliente falou de forma genérica (ex: "quero uma garrafa", "tem mochila?"), retorne null — não adivinhe qual produto ele quer.

Mensagens do cliente:
${messages.map(m => `- "${m}"`).join('\n')}

Categorias disponíveis: ${JSON.stringify(categories.map(c => c.name))}
Produtos disponíveis: ${JSON.stringify(products.map(p => p.title))}

IMPORTANTE: os valores de categoryName e productTitle devem ser COPIADOS LITERALMENTE das listas acima. Nunca reescreva, abrevie ou modifique. Se não tiver certeza, retorne null.

Responda APENAS em JSON válido:
{
  "categoryName": "<copiado literalmente da lista de categorias ou null>",
  "productTitle": "<copiado literalmente da lista de produtos — somente se o cliente identificar claramente um produto específico, senão null>"
}`

  console.log(`${tag} 🤖 Chamando Gemini...`)

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const result = await model.generateContent(prompt)
  const rawText = result.response.text()
  console.log(`${tag} 🤖 Resposta Gemini: ${rawText}`)

  const parsed = JSON.parse(rawText) as {
    categoryName: string | null
    productTitle: string | null
  }

  const updates: { categoryId?: string; productId?: string } = {}

  if (parsed.categoryName) {
    const match = categories.find(
      c => c.name.toLowerCase() === parsed.categoryName!.toLowerCase(),
    )
    if (match) updates.categoryId = match.id
    else console.warn(`${tag} ⚠️ Categoria "${parsed.categoryName}" não encontrada no banco`)
  }

  if (parsed.productTitle) {
    const match = products.find(
      p => p.title.toLowerCase() === parsed.productTitle!.toLowerCase(),
    )
    if (match) updates.productId = match.id
    else console.warn(`${tag} ⚠️ Produto "${parsed.productTitle}" não encontrado no banco`)
  }

  if (Object.keys(updates).length > 0) {
    await prisma.lead.update({ where: { id: leadId }, data: updates })
    console.log(`${tag} ✅ Lead ${leadId} atualizado:`, updates)
  } else {
    console.log(`${tag} ℹ️ Gemini não identificou correspondência — lead não atualizado`)
  }
}

export function addMessage(
  leadId: string,
  userId: string,
  message: string,
  isNew: boolean,
) {
  if (!message.trim()) {
    console.log(`${tag} Mensagem vazia ignorada — lead=${leadId}`)
    return
  }

  if (isNew) {
    console.log(`${tag} 🆕 Novo lead — iniciando buffer de ${WINDOW_MS / 1000}s — lead=${leadId} msg="${message}"`)

    const timer = setTimeout(() => {
      const entry = buffer.get(leadId)
      if (!entry) return
      buffer.delete(leadId)
      classify(leadId, userId, entry.messages).catch(err =>
        console.error(`${tag} ❌ Erro ao classificar lead ${leadId}:`, err),
      )
    }, WINDOW_MS)

    buffer.set(leadId, { userId, messages: [message], timer })
    return
  }

  const entry = buffer.get(leadId)
  if (entry && entry.messages.length < MAX_MESSAGES) {
    entry.messages.push(message)
    console.log(`${tag} ➕ Mensagem adicionada ao buffer — lead=${leadId} total=${entry.messages.length} msg="${message}"`)
  } else if (!entry) {
    console.log(`${tag} ℹ️ Buffer expirado ou inexistente — lead=${leadId} mensagem ignorada`)
  }
}
