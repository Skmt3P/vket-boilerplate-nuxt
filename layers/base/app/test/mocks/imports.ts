/*
 * Mock for #imports alias used in Nuxt 4 auto-imports
 * Re-export global mocks defined in setup.ts via vi.mock
 */
import { vi } from 'vitest'

// Mock i18n composables
export const useI18n = vi.fn(() => ({
  t: vi.fn((key: string) => {
    const messages: Record<string, string> = {
      next: 'Next',
      prev: 'Prev',
    }
    return messages[key] || key
  }),
  locale: { value: 'ja' },
}))

// Mock router composables
export const useRoute = vi.fn(() => ({
  path: '/test',
  query: { page: '1' },
}))

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
}))

// Mock other common Nuxt composables
export const useState = vi.fn()
export const useRuntimeConfig = vi.fn(() => ({}))
export const useFetch = vi.fn()
export const useLazyFetch = vi.fn()
export const useAsyncData = vi.fn()
export const useLazyAsyncData = vi.fn()
export const useNuxtApp = vi.fn(() => ({}))
export const useCookie = vi.fn()
export const useRequestHeaders = vi.fn(() => ({}))
export const navigateTo = vi.fn()
export const showError = vi.fn()
export const clearError = vi.fn()
export const useError = vi.fn()
export const createError = vi.fn()

// Default export for compatibility
export default {
  useI18n,
  useRoute,
  useRouter,
  useState,
  useRuntimeConfig,
  useFetch,
  useLazyFetch,
  useAsyncData,
  useLazyAsyncData,
  useNuxtApp,
  useCookie,
  useRequestHeaders,
  navigateTo,
  showError,
  clearError,
  useError,
  createError,
}
