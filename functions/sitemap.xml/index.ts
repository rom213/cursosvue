export const onRequestGet = async (): Promise<Response> => {
  const upstream = 'https://server.cursosestudiaytrabaja.store/sitemap.xml'
  const response = await fetch(upstream, {
    headers: {
      Accept: 'application/xml,text/xml,*/*',
    },
  })

  if (!response.ok) {
    return new Response('Sitemap unavailable', {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
