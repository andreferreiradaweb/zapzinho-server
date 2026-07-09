import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createQuizController } from './create-quiz'
import { listQuizzesController } from './list-quizzes'
import { deleteQuizController } from './delete-quiz'
import { saveQuizQuestionsController } from './save-quiz-questions'
import { listQuizLeadsController } from './list-quiz-leads'

export async function quizRoutes(app: FastifyInstance) {
  app.post('/quiz', { onRequest: [verifyJwt] }, createQuizController)
  app.get('/quiz', { onRequest: [verifyJwt] }, listQuizzesController)
  app.delete('/quiz/:id', { onRequest: [verifyJwt] }, deleteQuizController)
  app.put('/quiz/:id/questions', { onRequest: [verifyJwt] }, saveQuizQuestionsController)
  app.get('/quiz/:id/leads', { onRequest: [verifyJwt] }, listQuizLeadsController)
}
