// Importa o módulo interno direto, pulando o index.js do pacote — que roda um
// self-test lendo um PDF de exemplo do disco quando `module.parent` é undefined
// (é o caso sob o transform do Vitest/Vite), quebrando os testes.
import pdfParse from 'pdf-parse/lib/pdf-parse.js'

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer)
  const text = result.text.trim()
  if (!text) throw new Error('PDF não contém texto extraível')
  return text
}
