import { QuizRepository, QuizLeadRepository, QuizAnswerInput } from '@/repositories/quiz'
import { ResourceNotFound } from '@/error/resource-not-found'

interface SubmitParams {
  token: string
  name: string
  email: string
  phone: string
  answers: QuizAnswerInput[]
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
    const quiz = await this.quizRepo.findByToken(params.token)
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

    const lead = await this.leadRepo.create({
      quizId: quiz.id,
      name: params.name,
      email: params.email || emailAnswer?.textValue || '',
      phone: params.phone || phoneAnswer?.textValue || '',
      status,
      score,
    })

    if (params.answers.length > 0) {
      await this.leadRepo.createAnswers(lead.id, params.answers)
    }

    return { status, score, leadId: lead.id }
  }
}
