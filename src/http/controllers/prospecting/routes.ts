import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyIsActive } from '@/http/middlewares/verify-active'
import { importContactListController } from './import-contact-list'
import { listContactListsController } from './list-contact-lists'
import { getContactListController } from './get-contact-list'
import { moveToLeadController } from './move-to-lead'
import { getContactListCategoriesController } from './get-contact-list-categories'
import { deleteContactListController } from './delete-contact-list'
import { createProspectingBroadcastController } from './create-prospecting-broadcast'
import { sendProspectingBroadcastController } from './send-prospecting-broadcast'
import { listProspectingBroadcastsController } from './list-prospecting-broadcasts'
import { searchContactsController } from './search-contacts'

export async function prospectingRoutes(app: FastifyInstance) {
  // Contact lists
  app.get('/contact-list/search', { onRequest: [verifyJwt] }, searchContactsController)
  app.post('/contact-list', { onRequest: [verifyJwt] }, importContactListController)
  app.get('/contact-list', { onRequest: [verifyJwt] }, listContactListsController)
  app.get('/contact-list/:id', { onRequest: [verifyJwt] }, getContactListController)
  app.get('/contact-list/:id/categories', { onRequest: [verifyJwt] }, getContactListCategoriesController)
  app.delete('/contact-list/:id', { onRequest: [verifyJwt] }, deleteContactListController)
  app.post('/contact-list/contact/:contactId/move-to-lead', { onRequest: [verifyJwt] }, moveToLeadController)

  // Prospecting broadcasts
  app.post('/prospecting-broadcast', { onRequest: [verifyJwt] }, createProspectingBroadcastController)
  app.get('/prospecting-broadcast', { onRequest: [verifyJwt] }, listProspectingBroadcastsController)
  app.post('/prospecting-broadcast/:id/send', { onRequest: [verifyJwt, verifyIsActive] }, sendProspectingBroadcastController)
}
