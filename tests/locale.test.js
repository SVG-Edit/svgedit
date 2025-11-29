import { describe, expect, test } from 'vitest'
import { putLocale, t } from '../src/editor/locale.js'

const goodLangs = ['en', 'fr', 'de']

describe('locale loader', () => {
  test('falls back to English when lang is not supported', async () => {
    const result = await putLocale('xx', goodLangs)
    expect(result.langParam).toBe('en')
    expect(t('common.ok')).toBe('OK')
  })

  test('loads explicit test locale bundle', async () => {
    const result = await putLocale('test', goodLangs)
    expect(result.langParam).toBe('test')
    expect(t('common.ok')).toBe('OK')
    expect(t('misc.powered_by')).toBe('Powered by')
  })
})
