import type { RouteLocationNormalized, Router } from 'vue-router';

const CANONICAL_BASE_URL = 'https://cursosestudiaytrabaja.store';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
}

function canonicalPathForRoute(route: RouteLocationNormalized): string {
  if (route.name === 'affiliaty') {
    const categoryId = firstParam(route.params.id as string | string[] | undefined);
    if (categoryId) return `/courses/${encodeURIComponent(categoryId)}`;
  }

  if (route.name === 'courses-description') {
    const categoryId = firstParam(route.params.id as string | string[] | undefined);
    const courseSlug = firstParam(route.params.courseSlug as string | string[] | undefined);
    if (categoryId && courseSlug) {
      return `/courses/${encodeURIComponent(categoryId)}/${encodeURIComponent(courseSlug)}`;
    }
    if (categoryId) return `/courses/${encodeURIComponent(categoryId)}`;
  }

  return normalizePath(route.path);
}

function absoluteCanonicalUrl(path: string): string {
  return `${CANONICAL_BASE_URL}${normalizePath(path)}`;
}

function upsertCanonical(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

function upsertRobots(content: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'robots';
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function shouldNoindex(route: RouteLocationNormalized): boolean {
  return route.matched.some((record) => record.meta.noindex === true);
}

export function registerSeoGuards(router: Router): void {
  router.afterEach((to) => {
    if (typeof document === 'undefined') return;

    upsertCanonical(absoluteCanonicalUrl(canonicalPathForRoute(to)));
    upsertRobots(shouldNoindex(to) ? 'noindex,follow' : 'index,follow');
  });
}
