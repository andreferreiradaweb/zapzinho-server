export interface QuizOptionInput {
  text: string
  order: number
  isQualifying: boolean
}

export interface QuizQuestionInput {
  text: string
  type: string
  order: number
  options: QuizOptionInput[]
}

export interface QuizOptionData {
  id: string
  questionId: string
  text: string
  order: number
  isQualifying: boolean
}

export interface QuizQuestionData {
  id: string
  quizId: string
  text: string
  type: string
  order: number
  Options: QuizOptionData[]
}

export interface QuizData {
  id: string
  userId: string
  name: string
  description: string | null
  publicToken: string
  slug: string
  active: boolean
  welcomeMessage: string
  captureNameText: string
  capturePhone: boolean
  capturePhoneText: string
  captureEmail: boolean
  captureEmailText: string
  resultQualifiedTitle: string
  resultQualifiedMsg: string
  resultNotQualTitle: string
  resultNotQualMsg: string
  bgColor: string
  primaryColor: string
  createdAt: Date
  Questions: QuizQuestionData[]
  _count?: { Leads: number }
}

export interface QuizAnswerInput {
  questionId: string
  optionId?: string
  textValue?: string
}

export interface QuizLeadData {
  id: string
  quizId: string
  name: string | null
  email: string | null
  phone: string | null
  status: string
  score: number
  createdAt: Date
  Answers: {
    id: string
    questionId: string
    optionId: string | null
    textValue: string | null
    Question: { text: string; type: string }
    Option: { text: string; isQualifying: boolean } | null
  }[]
}

export interface QuizSettings {
  welcomeMessage?: string
  captureNameText?: string
  capturePhone?: boolean
  capturePhoneText?: string
  captureEmail?: boolean
  captureEmailText?: string
  resultQualifiedTitle?: string
  resultQualifiedMsg?: string
  resultNotQualTitle?: string
  resultNotQualMsg?: string
  bgColor?: string
  primaryColor?: string
}

export interface QuizRepository {
  create(data: {
    userId: string
    name: string
    description?: string
    slug: string
  }): Promise<{ id: string; publicToken: string; slug: string }>
  findAllByUserId(userId: string, offset: number, limit: number): Promise<QuizData[]>
  countByUserId(userId: string): Promise<number>
  findById(id: string): Promise<QuizData | null>
  findBySlug(slug: string): Promise<QuizData | null>
  delete(id: string): Promise<void>
  saveQuestions(quizId: string, questions: QuizQuestionInput[]): Promise<void>
  update(id: string, data: QuizSettings): Promise<void>
}

export interface QuizLeadRepository {
  create(data: {
    quizId: string
    name?: string
    email?: string
    phone?: string
    status: string
    score: number
  }): Promise<{ id: string }>
  updateLead(id: string, data: { status: string; score: number; name?: string; email?: string; phone?: string }): Promise<void>
  createAnswers(leadId: string, answers: QuizAnswerInput[]): Promise<void>
  findAllByQuizId(quizId: string, status?: string): Promise<QuizLeadData[]>
  delete(id: string): Promise<void>
}
