import { describe, expect, it, vi } from 'vitest'
import { PageViewCoordinator } from '../pageViewCoordinator'

describe('PageViewCoordinator', () => {
  it('emite una sola vista con el título final y URLs limpias', () => {
    const emit = vi.fn()
    const coordinator = new PageViewCoordinator(emit)
    const token = coordinator.begin({
      pageLocation: 'https://example.test/courses/306/tematica?gtm_debug=x&utm_source=mail',
      pageReferrer: 'https://example.test/courses?gtm_preview=env-2',
    })

    expect(coordinator.complete(token, 'Bisutería y joyería desde cero | Taller Maestro')).toBe(true)
    expect(coordinator.complete(token, 'Título duplicado')).toBe(false)
    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith({
      page_title: 'Bisutería y joyería desde cero | Taller Maestro',
      page_location: 'https://example.test/courses/306/tematica?utm_source=mail',
      page_path: '/courses/306/tematica?utm_source=mail',
      page_referrer: 'https://example.test/courses',
    })
  })

  it('ignora consultas viejas después de una navegación posterior', () => {
    const emit = vi.fn()
    const coordinator = new PageViewCoordinator(emit)
    const staleToken = coordinator.begin({ pageLocation: 'https://example.test/old' })
    const currentToken = coordinator.begin({ pageLocation: 'https://example.test/new' })

    expect(coordinator.complete(staleToken, 'Old')).toBe(false)
    expect(coordinator.complete(currentToken, 'New')).toBe(true)
    expect(emit).toHaveBeenCalledTimes(1)
  })

  it('permite una nueva vista al volver a una URL ya visitada', () => {
    const emit = vi.fn()
    const coordinator = new PageViewCoordinator(emit)

    const firstToken = coordinator.begin({ pageLocation: 'https://example.test/topic' })
    coordinator.complete(firstToken, 'Topic')
    const secondToken = coordinator.begin({ pageLocation: 'https://example.test/topic' })
    coordinator.complete(secondToken, 'Topic')

    expect(emit).toHaveBeenCalledTimes(2)
  })
})
