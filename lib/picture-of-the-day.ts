import { getDayOfYear } from 'date-fns';

export type PictureOfTheDay = {
  imageUrl: string;
  title: string;
  description?: string;
  credit?: string;
  creditUrl?: string;
  sourceUrl: string;
  source: string;
};

type SourceFetcher = {
  name: string;
  enabled: () => boolean;
  fetch: () => Promise<PictureOfTheDay | null>;
};

async function fetchNasaApod(): Promise<PictureOfTheDay | null> {
  const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  // Skip video days — we only want images
  if (data.media_type !== 'image') {
    return null;
  }

  return {
    imageUrl: data.hdurl ?? data.url,
    title: data.title,
    description: data.explanation,
    credit: data.copyright,
    creditUrl: 'https://apod.nasa.gov/apod/astropix.html',
    sourceUrl: 'https://apod.nasa.gov/apod/astropix.html',
    source: 'NASA APOD',
  };
}

async function fetchBingDaily(): Promise<PictureOfTheDay | null> {
  const res = await fetch(
    'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US',
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const image = data.images?.[0];

  if (!image) {
    return null;
  }

  // Use UHD resolution via urlbase
  const imageUrl = `https://www.bing.com${image.urlbase}_UHD.jpg`;

  // Bing copyright format: "Description (© Photographer)"
  const copyrightMatch = image.copyright?.match(/^(.*?)\s*\(©\s*(.*?)\)$/);
  const title = image.title || copyrightMatch?.[1]?.trim() || 'Bing Daily Image';
  const credit = copyrightMatch?.[2]?.trim() ?? image.copyright;

  return {
    imageUrl,
    title,
    credit,
    creditUrl: image.copyrightlink || 'https://www.bing.com',
    sourceUrl: image.copyrightlink || 'https://www.bing.com',
    source: 'Bing',
  };
}

async function fetchUnsplashRandom(): Promise<PictureOfTheDay | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return null;
  }

  const res = await fetch(
    'https://api.unsplash.com/photos/random?orientation=landscape&query=nature',
    {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  return {
    imageUrl: data.urls?.full ?? data.urls?.regular,
    title: data.alt_description ?? data.description ?? 'Photo of the Day',
    credit: data.user?.name,
    creditUrl: data.user?.links?.html
      ? `${data.user.links.html}?utm_source=portfolio&utm_medium=referral`
      : undefined,
    sourceUrl: data.links?.html ?? 'https://unsplash.com',
    source: 'Unsplash',
  };
}

const sources: SourceFetcher[] = [
  { name: 'NASA APOD', enabled: () => true, fetch: fetchNasaApod },
  { name: 'Bing', enabled: () => true, fetch: fetchBingDaily },
  {
    name: 'Unsplash',
    fetch: fetchUnsplashRandom,
    enabled: () => !!process.env.UNSPLASH_ACCESS_KEY,
  },
];

export async function getPictureOfTheDay(): Promise<PictureOfTheDay | null> {
  const activeSources = sources.filter((s) => s.enabled());

  if (activeSources.length === 0) {
    return null;
  }

  const dayOfYear = getDayOfYear(new Date());
  const startIndex = dayOfYear % activeSources.length;

  // Try each source starting from the day-rotated index, cycling through all
  for (let i = 0; i < activeSources.length; i++) {
    const source = activeSources[(startIndex + i) % activeSources.length];
    try {
      const result = await source.fetch();
      if (result) {
        return result;
      }
    } catch {
      // Source failed — try next
    }
  }

  return null;
}
