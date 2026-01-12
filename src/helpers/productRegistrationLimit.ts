import { PRODUCT_REGISTRATION_LIMIT } from '@/constants/house'

enum Plan {
  PADRAO = 'PADRAO',
  VIP = 'VIP',
  EXPERT = 'EXPERT',
}

export const getProductRegisterLimitByPlan = (plan: Plan): number => {
  switch (plan) {
    case Plan.PADRAO:
      return PRODUCT_REGISTRATION_LIMIT.PADRAO
    case Plan.VIP:
      return PRODUCT_REGISTRATION_LIMIT.VIP
    case Plan.EXPERT:
      return PRODUCT_REGISTRATION_LIMIT.EXPERT
    default:
      return PRODUCT_REGISTRATION_LIMIT.PADRAO
  }
}
