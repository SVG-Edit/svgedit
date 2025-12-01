import { afterEach, describe, expect, test } from 'vitest'
import { putLocale, t } from '../src/editor/locale.js'

const goodLangs = ['en', 'fr', 'de']
const originalNavigator = {
  userLanguage: navigator.userLanguage,
  language: navigator.language
}

const setNavigatorProp = (prop, value) => {
  Object.defineProperty(navigator, prop, {
    value,
    configurable: true,
    writable: true
  })
}

const restoreNavigatorProp = (prop, value) => {
  if (value === undefined) {
    Reflect.deleteProperty(navigator, prop)
    return
  }
  setNavigatorProp(prop, value)
}

afterEach(() => {
  restoreNavigatorProp('userLanguage', originalNavigator.userLanguage)
  restoreNavigatorProp('language', originalNavigator.language)
})

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

  test('uses navigator.userLanguage when available', async () => {
    setNavigatorProp('userLanguage', 'fr')
    setNavigatorProp('language', 'en-US')

    const result = await putLocale('', goodLangs)
    expect(result.langParam).toBe('fr')
    expect(t('common.ok')).toBe('OK')
  })

  test('uses navigator.language and still falls back to English for unsupported locale', async () => {
    Reflect.deleteProperty(navigator, 'userLanguage')
    setNavigatorProp('language', 'pt-BR')

    const result = await putLocale('', goodLangs)
    expect(result.langParam).toBe('en')
    expect(t('common.ok')).toBe('OK')
  })
})
