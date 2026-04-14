import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  PASSWORD_ADMIN: z.string(),
  ADMIN_EMAIL: z.string().default('admin@example.com'),
  // W-API (WhatsApp)
  WAPI_BASE_URL: z.string().default('https://api.w-api.app/v1'),
  WAPI_TOKEN: z.string().default(''),
  WAPI_INSTANCE_ID: z.string().default(''),
  WAPI_DELAY_MS: z.coerce.number().default(1500),
  WAPI_WEBHOOK_SECRET: z.string().default(''),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
