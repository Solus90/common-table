import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Common Table',
    short_name: 'Common Table',
    description: 'Hyperlocal mutual aid for your neighborhood — share, give, and support one another.',
    start_url: '/feed',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#3D6B4F',
    background_color: '#FAF8F5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['social', 'lifestyle'],
  }
}
