import { QuizRepository, QuizLeadRepository, QuizAnswerInput } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

interface SubmitParams {
  slug: string
  name: string
  email: string
  phone: string
  answers: QuizAnswerInput[]
  leadId?: string
}

function calculateQualification(
  questions: { id: string; type: string; Options: { id: string; isQualifying: boolean }[] }[],
  answers: QuizAnswerInput[],
): { status: string; score: number } {
  const gates = questions.filter(
    (q) => q.type === 'RADIO' && q.Options.some((o) => o.isQualifying),
  )
  if (gates.length === 0) return { status: 'QUALIFIED', score: 100 }

  let passed = 0
  for (const gate of gates) {
    const answer = answers.find((a) => a.questionId === gate.id)
    if (!answer?.optionId) continue
    const opt = gate.Options.find((o) => o.id === answer.optionId)
    if (opt?.isQualifying) passed++
  }

  const score = Math.round((passed / gates.length) * 100)
  const status = passed === gates.length ? 'QUALIFIED' : 'NOT_QUALIFIED'
  return { status, score }
}

export class PublicSubmitQuizUseCase {
  constructor(
    private quizRepo: QuizRepository,
    private leadRepo: QuizLeadRepository,
  ) {}

  async execute(params: SubmitParams) {
    const quiz = await this.quizRepo.findBySlug(params.slug)
    if (!quiz) throw new ResourceNotFound()

    const { status, score } = calculateQualification(quiz.Questions, params.answers)

    // Extract email/phone from typed questions if not provided in body
    const emailAnswer = params.answers.find((a) => {
      const q = quiz.Questions.find((q) => q.id === a.questionId)
      return q?.type === 'EMAIL'
    })
    const phoneAnswer = params.answers.find((a) => {
      const q = quiz.Questions.find((q) => q.id === a.questionId)
      return q?.type === 'WHATSAPP'
    })

    const resolvedEmail = params.email || emailAnswer?.textValue || ''
    const resolvedPhone = params.phone || phoneAnswer?.textValue || ''

    let leadId: string
    if (params.leadId) {
      await this.leadRepo.updateLead(params.leadId, {
        status,
        score,
        name: params.name,
        email: resolvedEmail,
        phone: resolvedPhone,
      })
      leadId = params.leadId
    } else {
      const lead = await this.leadRepo.create({
        quizId: quiz.id,
        name: params.name,
        email: resolvedEmail,
        phone: resolvedPhone,
        status,
        score,
      })
      leadId = lead.id
    }

    if (params.answers.length > 0) {
      await this.leadRepo.createAnswers(leadId, params.answers)
    }

    return { status, score, leadId }
  }
}
