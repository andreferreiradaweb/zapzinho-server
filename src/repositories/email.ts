export interface EmailListData {
  id: string
  userId: string
  name: string
  publicToken: string
  createdAt: Date
  _count?: { Subscribers: number }
}

export interface EmailSubscriberData {
  id: string
  emailListId: string
  email: string
  name: string | null
  status: string
  source: string
  createdAt: Date
}

export interface EmailCampaignData {
  id: string
  userId: string
  emailListId: string
  name: string
  subject: string
  body: string
  status: string
  totalSent: number
  totalFailed: number
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
}

export interface EmailListRepository {
  create(data: { userId: string; name: string }): Promise<EmailListData>
  findAllByUserId(userId: string): Promise<EmailListData[]>
  findById(id: string): Promise<EmailListData | null>
  findByPublicToken(token: string): Promise<EmailListData | null>
  delete(id: string): Promise<void>
}

export interface EmailSubscriberRepository {
  create(data: {
    emailListId: string
    email: string
    name?: string
    source?: string
  }): Promise<EmailSubscriberData>
  findAllByListId(
    emailListId: string,
    offset: number,
    limit: number,
  ): Promise<EmailSubscriberData[]>
  countByListId(emailListId: string): Promise<number>
  countSubscribedByListId(emailListId: string): Promise<number>
  findById(id: string): Promise<EmailSubscriberData | null>
  findByListAndEmail(
    emailListId: string,
    email: string,
  ): Promise<EmailSubscriberData | null>
  delete(id: string): Promise<void>
  findSubscribedByListId(emailListId: string): Promise<EmailSubscriberData[]>
}

export interface EmailCampaignRepository {
  create(data: {
    userId: string
    emailListId: string
    name: string
    subject: string
    body: string
  }): Promise<EmailCampaignData>
  findAllByUserId(userId: string): Promise<EmailCampaignData[]>
  findById(id: string): Promise<EmailCampaignData | null>
  updateStatus(
    id: string,
    status: string,
    extra?: Partial<{ startedAt: Date; finishedAt: Date }>,
  ): Promise<void>
  incrementCount(id: string, field: 'totalSent' | 'totalFailed'): Promise<void>
  delete(id: string): Promise<void>
}
