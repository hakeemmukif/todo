/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENABLE_OFFLINE_MODE?: string
  readonly VITE_VERCEL_ENV?: string
  readonly VITE_ENABLE_DEBUG_LOGS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
