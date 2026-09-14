import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Konfigurasi Prisma 7 — koneksi database dipisah dari schema.prisma
// DATABASE_URL wajib diset di environment variable (lihat .env.example)
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
