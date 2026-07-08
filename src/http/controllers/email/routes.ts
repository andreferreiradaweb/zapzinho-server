import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { createEmailListController } from './create-email-list'
import { listEmailListsController } from './list-email-lists'
import { deleteEmailListController } from './delete-email-list'
import { addEmailSubscriberController } from './add-email-subscriber'
import { listEmailSubscribersController } from './list-email-subscribers'
import { removeEmailSubscriberController } from './remove-email-subscriber'
import { createEmailCampaignController } from './create-email-campaign'
import { listEmailCampaignsController } from './list-email-campaigns'
import { sendEmailCampaignController } from './send-email-campaign'

export async function emailRoutes(app: FastifyInstance) {
  // Lists
  app.post('/email-list', { onRequest: [verifyJwt] }, createEmailListController)
  app.get('/email-list', { onRequest: [verifyJwt] }, listEmailListsController)
  app.delete(
    '/email-list/:id',
    { onRequest: [verifyJwt] },
    deleteEmailListController,
  )

  // Subscribers
  app.post(
    '/email-list/:listId/subscriber',
    { onRequest: [verifyJwt] },
    addEmailSubscriberController,
  )
  app.get(
    '/email-list/:listId/subscriber',
    { onRequest: [verifyJwt] },
    listEmailSubscribersController,
  )
  app.delete(
    '/email-subscriber/:subscriberId',
    { onRequest: [verifyJwt] },
    removeEmailSubscriberController,
  )

  // Campaigns
  app.post(
    '/email-campaign',
    { onRequest: [verifyJwt] },
    createEmailCampaignController,
  )
  app.get(
    '/email-campaign',
    { onRequest: [verifyJwt] },
    listEmailCampaignsController,
  )
  app.post(
    '/email-campaign/:id/send',
    { onRequest: [verifyJwt] },
    sendEmailCampaignController,
  )
}
