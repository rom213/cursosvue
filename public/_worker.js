export default {
  async fetch(request, env) {
    // /sitemap.xml y /sitemap-cursos.xml se sirven como archivos estáticos
    // desde public/ (ya no se proxean al backend).
    return env.ASSETS.fetch(request)
  },
}
