import { prisma } from '@/lib/prisma'
import {
  QuizRepository,
  QuizLeadRepository,
  QuizData,
  QuizLeadData,
  QuizQuestionInput,
  QuizAnswerInput,
  QuizSettings,
} from '@/repositories/quiz'

export class PrismaQuizRepository implements QuizRepository {
  async create(data: { userId: string; name: string; description?: string }) {
    const quiz = await prisma.quiz.create({
      data: { userId: data.userId, name: data.name, description: data.description },
      select: { id: true, publicToken: true },
    })
    return quiz
  }

  async findAllByUserId(userId: string): Promise<QuizData[]> {
    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        Questions: {
          orderBy: { order: 'asc' },
          include: { Options: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { Leads: true } },
      },
    })
    return quizzes as unknown as QuizData[]
  }

  async findById(id: string): Promise<QuizData | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        Questions: {
          orderBy: { order: 'asc' },
          include: { Options: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { Leads: true } },
      },
    })
    return quiz as unknown as QuizData | null
  }

  async findByToken(token: string): Promise<QuizData | null> {
    const quiz = await prisma.quiz.findUnique({
      where: { publicToken: token, active: true },
      include: {
        Questions: {
          orderBy: { order: 'asc' },
          include: { Options: { orderBy: { order: 'asc' } } },
        },
      },
    })
    return quiz as unknown as QuizData | null
  }

  async delete(id: string): Promise<void> {
    await prisma.quiz.delete({ where: { id } })
  }

  async update(id: string, data: QuizSettings): Promise<void> {
    await prisma.quiz.update({ where: { id }, data })
  }

  async saveQuestions(quizId: string, questions: QuizQuestionInput[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.quizQuestion.deleteMany({ where: { quizId } })
      for (const q of questions) {
        await tx.quizQuestion.create({
          data: {
            quizId,
            text: q.text,
            type: q.type,
            order: q.order,
            Options: {
              create: q.options.map((o) => ({
                text: o.text,
                order: o.order,
                isQualifying: o.isQualifying,
              })),
            },
          },
        })
      }
    })
  }
}

export class PrismaQuizLeadRepository implements QuizLeadRepository {
  async create(data: {
    quizId: string
    name?: string
    email?: string
    phone?: string
    status: string
    score: number
  }): Promise<{ id: string }> {
    const lead = await prisma.quizLead.create({
      data,
      select: { id: true },
    })
    return lead
  }

  async createAnswers(leadId: string, answers: QuizAnswerInput[]): Promise<void> {
    await prisma.quizAnswer.createMany({
      data: answers.map((a) => ({
        leadId,
        questionId: a.questionId,
        optionId: a.optionId ?? null,
        textValue: a.textValue ?? null,
      })),
    })
  }

  async findAllByQuizId(quizId: string, status?: string): Promise<QuizLeadData[]> {
    const leads = await prisma.quizLead.findMany({
      where: { quizId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        Answers: {
          include: {
            Question: { select: { text: true, type: true } },
            Option: { select: { text: true, isQualifying: true } },
          },
        },
      },
    })
    return leads as unknown as QuizLeadData[]
  }

  async delete(id: string): Promise<void> {
    await prisma.quizLead.delete({ where: { id } })
  }
}
