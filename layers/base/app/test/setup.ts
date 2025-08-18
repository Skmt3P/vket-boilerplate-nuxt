import { vi } from 'vitest'

// Global mock for all icon imports
vi.mock('~icons/ri/close-line', () => ({
  default: {
    name: 'RiCloseLine',
    template: '<svg class="icon"><path /></svg>',
    props: ['class'],
  },
}))

// Comprehensive Nuxt composables mocks
const createI18nMock = () => ({
  t: (key: string) => {
    const messages: Record<string, string> = {
      next: 'Next',
      prev: 'Prev',
    }
    return messages[key] || key
  },
  locale: { value: 'ja' },
})

const createRouteMock = () => ({
  path: '/test',
  query: { page: '1' },
})

// Global composable mocks
vi.stubGlobal('useI18n', createI18nMock)
vi.stubGlobal('useRoute', createRouteMock)

// Mock #imports completely
vi.mock('#imports', () => ({
  useI18n: createI18nMock,
  useRoute: createRouteMock,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock @nuxtjs/i18n runtime
vi.mock('@nuxtjs/i18n', () => ({
  useI18n: createI18nMock,
}))

// Mock @nuxtjs/i18n/dist/runtime/composables
vi.mock('@nuxtjs/i18n', () => ({
  useI18n: createI18nMock,
}))

// Mock @nuxtjs/i18n/dist/runtime/composables/index.js
vi.mock('@nuxtjs/i18n', () => ({
  useI18n: createI18nMock,
}))

// Mock #app
vi.mock('#app', () => ({
  useI18n: createI18nMock,
  useRoute: createRouteMock,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// HTMLDialogElement mock for jsdom
if (!global.HTMLDialogElement) {
  class MockHTMLDialogElement extends HTMLElement {
    open = false
    returnValue = ''

    showModal = vi.fn(() => {
      this.open = true
    })

    close = vi.fn(() => {
      this.open = false
    })

    show = vi.fn(() => {
      this.open = true
    })

    requestClose = vi.fn()

    override addEventListener(_event: string, _callback: (...args: unknown[]) => void) {
      // Mock implementation
    }

    override removeEventListener(_event: string, _callback: (...args: unknown[]) => void) {
      // Mock implementation
    }
  }

  global.HTMLDialogElement = MockHTMLDialogElement as unknown as {
    new (): HTMLDialogElement
    prototype: HTMLDialogElement
  }

  // Make sure it's available on window too
  if (typeof window !== 'undefined') {
    window.HTMLDialogElement = MockHTMLDialogElement
  }
}
