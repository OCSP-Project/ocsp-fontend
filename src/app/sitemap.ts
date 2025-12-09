import { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ocsp-tech-web.site/api';
const SITE_URL = 'https://ocsp-tech-web.site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Fetch published news
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_BASE_URL}/news?page=1&pageSize=100`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const news = await response.json();
      newsRoutes = news.map((item: any) => ({
        url: `${SITE_URL}/news/${item.id}`,
        lastModified: new Date(item.updatedAt || item.publishedAt || item.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch news for sitemap:', error);
  }

  return [...staticRoutes, ...newsRoutes];
}
