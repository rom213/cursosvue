import { dispatchTrackingEvent } from './trackingDispatcher'
import {
  cleanTrackingLocation,
  cleanTrackingReferrer,
  type CleanTrackingLocation,
} from './trackingUrl'

export interface PageViewContext extends Record<string, unknown> {
  page_title: string
  page_location: string
  page_path: string
  page_referrer?: string
}

export interface BeginPageViewInput {
  pageLocation: string
  pageReferrer?: string
}

type PageViewEmitter = (context: PageViewContext) => void

interface PendingPageView extends CleanTrackingLocation {
  token: number
  pageReferrer?: string
  context?: PageViewContext
}

function defaultEmitter(context: PageViewContext): void {
  dispatchTrackingEvent({
    analytics: { name: 'page_view', parameters: context },
    backend: {
      name: 'PageView',
      fields: {
        event_source_url: context.page_location,
        referrer_url: context.page_referrer,
      },
    },
  })
}

/**
 * Coordina una sola vista por navegación. Un token evita que una consulta vieja
 * complete por accidente una navegación posterior, incluso si ambas usan la misma URL.
 */
export class PageViewCoordinator {
  private sequence = 0
  private active?: PendingPageView
  private lastContext?: PageViewContext

  constructor(private readonly emit: PageViewEmitter = defaultEmitter) {}

  begin(input: BeginPageViewInput): number {
    const clean = cleanTrackingLocation(input.pageLocation)
    const token = ++this.sequence
    this.active = {
      token,
      ...clean,
      pageReferrer: cleanTrackingReferrer(input.pageReferrer),
    }
    return token
  }

  complete(token: number, pageTitle: string): boolean {
    const pending = this.active
    if (!pending || pending.token !== token || pending.context) return false

    const context: PageViewContext = {
      page_title: pageTitle,
      page_location: pending.pageLocation,
      page_path: pending.pagePath,
      page_referrer: pending.pageReferrer,
    }
    pending.context = context
    this.lastContext = context
    this.emit(context)
    return true
  }

  activeTokenFor(pageLocation: string): number | undefined {
    if (!this.active) return undefined
    const clean = cleanTrackingLocation(pageLocation)
    return clean.pageLocation === this.active.pageLocation ? this.active.token : undefined
  }

  currentContext(): PageViewContext | undefined {
    if (this.active) return this.active.context
    return this.lastContext
  }
}

export const pageViewCoordinator = new PageViewCoordinator()

export function currentPageTrackingContext(): PageViewContext {
  const current = pageViewCoordinator.currentContext()
  if (current) return current

  const clean = cleanTrackingLocation(window.location.href)
  return {
    page_title: document.title,
    page_location: clean.pageLocation,
    page_path: clean.pagePath,
    page_referrer: cleanTrackingReferrer(document.referrer),
  }
}
