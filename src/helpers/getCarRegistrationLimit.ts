import { HOUSE_REGISTRATION_LIMIT } from '@/constants/house'
import { Plan } from '@prisma/client'

export const getHouseRegisterLimitByPlan = (plan: Plan): number => {
  switch (plan) {
    case Plan.PADRAO:
      return HOUSE_REGISTRATION_LIMIT.PADRAO
    case Plan.VIP:
      return HOUSE_REGISTRATION_LIMIT.VIP
    case Plan.EXPERT:
      return HOUSE_REGISTRATION_LIMIT.EXPERT
    default:
      return HOUSE_REGISTRATION_LIMIT.PADRAO
  }
}
