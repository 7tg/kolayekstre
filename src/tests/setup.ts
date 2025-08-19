import { vi } from 'vitest'

global.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

global.IDBKeyRange = {
  bound: vi.fn(),
  only: vi.fn(),
  lowerBound: vi.fn(),
  upperBound: vi.fn(),
}

global.alert = vi.fn()
global.confirm = vi.fn(() => true)