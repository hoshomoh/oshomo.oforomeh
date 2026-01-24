import type { MetadataRoute } from 'next';

import {
  CITIZENSHIP_TEST_APP_URL,
  EXPENSE_WISE_URL,
  PRIVACY_POLICY_URL,
  PUBLIC_URL,
} from '@/lib/constant';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: PUBLIC_URL,
      lastModified: '2026-01-24',
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: CITIZENSHIP_TEST_APP_URL,
      lastModified: '2026-01-24',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: EXPENSE_WISE_URL,
      lastModified: '2026-01-24',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: PRIVACY_POLICY_URL,
      lastModified: '2026-01-24',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
