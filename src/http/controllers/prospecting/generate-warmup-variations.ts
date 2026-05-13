import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/config/validatedEnv";

const bodySchema = z.object({
  baseMessage: z.string().min(1),
});

export async function generateWarmupVariationsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { baseMessage } = bodySchema.parse(request.body);

  if (!env.GEMINI_API_KEY) {
    return reply
      .status(503)
      .send({ message: "GEMINI_API_KEY não configurada" });
  }

  const prompt = `Você é um especialista em prospecção pelo WhatsApp no Brasil.

Gere 5 variações da seguinte mensagem inicial de prospecção:
"${baseMessage}"

Regras obrigatórias:
- Cada variação deve transmitir a mesma intenção, mas com palavras diferentes
- Devem ser curtas (1-2 frases no máximo)
- Linguagem natural e informal (Brasil)
- Sem asteriscos, sem formatação markdown
- Não comercial — apenas quebra-gelo
- Variadas entre si: diferentes estruturas, saudações, abordagens

Responda APENAS com as 5 variações, uma por linha, numeradas de 1 a 5. Sem explicações.`;

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const variations = text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);

  return reply.status(200).send({ variations });
}
