import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vitest-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/zapzinho_test',
      JWT_SECRET: 'test-jwt-secret-key-for-tests-only',
      NODE_ENV: 'test',
      PORT: '3335',
      PASSWORD_ADMIN: 'TestAdmin1!',
      ADMIN_EMAIL: 'admin@test.com',
      RESEND_API_KEY: 're_test_xxxx',
      WAPI_TOKEN: 'test-wapi-token',
      WAPI_INSTANCE_ID: 'test-instance',
      WAPI_DELAY_MS: '0',
      WAPI_DELAY_MIN_MS: '0',
      WAPI_DELAY_MAX_MS: '0',
      WAPI_WEBHOOK_SECRET: '',
      GEMINI_API_KEY: '',
      FRONTEND_URL: 'http://localhost:5173',
      CLOUDINARY_CLOUD_NAME: '',
      CLOUDINARY_API_KEY: '',
      CLOUDINARY_API_SECRET: '',
      SERP_API_KEY: '',
      SERP_DAILY_LIMIT: '3',
      CONTACT_LIST_MAX: '300',
    },
    include: ['src/tests/**/*.spec.ts'],
    sequence: { concurrent: false },
  },
})
