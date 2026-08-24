import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/config/validatedEnv'
import { MediaAsset } from '@/lib/prisma'
import { PrismaDocumentRepository } from '@/repositories/prisma/document'
import { PrismaMediaAssetRepository } from '@/repositories/prisma/media-asset'

const MAX_CONTEXT_CHARS = 40_000 // orçamento de contexto vindo dos documentos
const MAX_MEDIA_CANDIDATES = 20

const tag = '[RAG]'

interface GenerateRagReplyRequest {
  userId: string
  message: string
}

export interface RagReplyResult {
  text: string
  media: MediaAsset | null
}

export async function generateRagReply({
  userId,
  message,
}: GenerateRagReplyRequest): Promise<RagReplyResult | null> {
  if (!env.GEMINI_API_KEY) {
    console.warn(`${tag} ❌ GEMINI_API_KEY não configurada — abortando`)
    return null
  }

  const documentRepo = new PrismaDocumentRepository()
  const mediaRepo = new PrismaMediaAssetRepository()

  const [documents, mediaCandidates] = await Promise.all([
    documentRepo.findProcessedByUserId(userId),
    mediaRepo.listCandidatesForRag(userId, MAX_MEDIA_CANDIDATES),
  ])

  if (!documents.length && !mediaCandidates.length) {
    console.log(`${tag} ⚠️ userId=${userId} sem documentos nem mídias cadastradas — pulando`)
    return null
  }

  const context = buildDocumentContext(documents)
  const mediaList = mediaCandidates.map((m) => ({
    title: m.title,
    type: m.type,
    description: m.description ?? '',
  }))

  const prompt = `Você é um atendente virtual de uma empresa que vende pelo WhatsApp (Brasil).

Use SOMENTE as informações da base de conhecimento abaixo para responder o cliente. Se a pergunta não puder ser respondida com essas informações, responda de forma simpática dizendo que vai verificar e retornar, sem inventar dados.

BASE DE CONHECIMENTO:
${context || '(nenhum documento cadastrado)'}

MÍDIAS DISPONÍVEIS PARA ENVIAR (escolha uma somente se for claramente relevante pra resposta):
${JSON.stringify(mediaList)}

MENSAGEM DO CLIENTE:
"${message}"

Responda a mensagem do cliente:
- Tom natural, direto, como um atendente real
- Máximo 2-3 parágrafos curtos
- Sem asteriscos nem formatação markdown

Responda APENAS em JSON válido:
{
  "reply": "<texto da resposta pro cliente>",
  "mediaTitle": "<título copiado literalmente da lista de mídias, ou null se nenhuma se aplicar>"
}`

  console.log(`${tag} 🤖 Chamando Gemini — userId=${userId} docs=${documents.length} mídias=${mediaCandidates.length}`)

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const result = await model.generateContent(prompt)
  const rawText = result.response.text()
  const parsed = JSON.parse(rawText) as { reply: string; mediaTitle: string | null }

  const media = parsed.mediaTitle
    ? mediaCandidates.find((m) => m.title.toLowerCase() === parsed.mediaTitle!.toLowerCase()) ?? null
    : null

  return { text: parsed.reply, media }
}

function buildDocumentContext(documents: { title: string; content: string | null }[]): string {
  let remaining = MAX_CONTEXT_CHARS
  const parts: string[] = []

  for (const doc of documents) {
    if (!doc.content || remaining <= 0) continue
    const chunk = doc.content.slice(0, remaining)
    parts.push(`### ${doc.title}\n${chunk}`)
    remaining -= chunk.length
  }

  return parts.join('\n\n')
}
