import { registerAs } from '@nestjs/config';

export interface AiConfig {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  // Gemini (primary LLM)
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  // Groq (fallback LLM via OpenAI-compatible SDK)
  GROQ_API_KEY: string;
  GROQ_BASE_URL: string;
  GROQ_MODEL: string;
  BACKEND_API_URL: string;
  INTERNAL_API_KEY: string;
  SUPABASE_S3_ENDPOINT: string;
  SUPABASE_S3_BUCKET: string;
  SUPABASE_S3_ACCESS_KEY: string;
  SUPABASE_S3_SECRET_KEY: string;
  SUPABASE_S3_REGION: string;
}

export const aiConfig = registerAs('ai', (): AiConfig => ({
  REDIS_HOST: process.env['REDIS_HOST'] ?? '127.0.0.1',
  REDIS_PORT: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  REDIS_PASSWORD: process.env['REDIS_PASSWORD'],
  // Gemini 2.5 Flash — primary: optimal untuk dokumen analysis (balance kualitas+kecepatan+biaya)
  GEMINI_API_KEY: process.env['GEMINI_API_KEY'] ?? '',
  GEMINI_MODEL: process.env['GEMINI_MODEL'] ?? 'gemini-2.5-flash',
  // Groq llama-3.3-70b-versatile — fallback: cepat, free tier, OpenAI-compatible
  GROQ_API_KEY: process.env['GROQ_API_KEY'] ?? '',
  GROQ_BASE_URL: process.env['GROQ_BASE_URL'] ?? 'https://api.groq.com/openai/v1',
  GROQ_MODEL: process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile',
  BACKEND_API_URL: process.env['BACKEND_API_URL'] ?? 'http://localhost:3000',
  INTERNAL_API_KEY: process.env['INTERNAL_API_KEY'] ?? '',
  SUPABASE_S3_ENDPOINT: process.env['SUPABASE_S3_ENDPOINT'] ?? '',
  SUPABASE_S3_BUCKET: process.env['SUPABASE_S3_BUCKET'] ?? '',
  SUPABASE_S3_ACCESS_KEY: process.env['SUPABASE_S3_ACCESS_KEY'] ?? '',
  SUPABASE_S3_SECRET_KEY: process.env['SUPABASE_S3_SECRET_KEY'] ?? '',
  SUPABASE_S3_REGION: process.env['SUPABASE_S3_REGION'] ?? 'ap-southeast-1',
}));
