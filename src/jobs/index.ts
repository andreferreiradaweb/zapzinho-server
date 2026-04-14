import cron from 'node-cron'
import { runReactivationJob } from './reactivation'
import { runTrialExpiryJob } from './trial-expiry'

export function startCronJobs() {
  // Reactivation: daily at 09:00
  cron.schedule('0 9 * * *', () => {
    runReactivationJob().catch((err) =>
      console.error('[Cron] Reactivation job error:', err),
    )
  })

  // Trial expiry upsell: daily at 10:00
  cron.schedule('0 10 * * *', () => {
    runTrialExpiryJob().catch((err) =>
      console.error('[Cron] Trial expiry job error:', err),
    )
  })

  console.log('[Cron] Jobs scheduled: reactivation (09:00), trial-expiry (10:00)')
}
