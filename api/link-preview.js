import { requireAuthenticatedUser } from './_firebase-auth.js';

function extractMetaTag(html, key, attribute = 'property') {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i',
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["'][^>]*>`,
    'i',
  );

  return html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1] ?? '';
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
}

function extractLinkTag(html, relValue) {
  const escaped = relValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<link[^>]+rel=["'][^"']*${escaped}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, 'i');
  const reversePattern = new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${escaped}[^"']*["'][^>]*>`, 'i');

  return html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1] ?? '';
}

function toAbsoluteUrl(url, baseUrl) {
  if (!url) {
    return '';
  }

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return '';
  }
}

export default async function handler(request, response) {
  const authenticatedUser = await requireAuthenticatedUser(request, response);
  if (!authenticatedUser) {
    return;
  }

  const rawUrl = request.query?.url;
  const url = Array.isArray(rawUrl) ? rawUrl[0] : rawUrl;

  if (!url) {
    return response.status(400).json({ error: 'Missing url parameter.' });
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return response.status(400).json({ error: 'Invalid URL.' });
  }

  if (!/^https?:$/.test(targetUrl.protocol)) {
    return response.status(400).json({ error: 'Only http and https URLs are supported.' });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; VibeCodingStarterBot/1.0; +https://vercel.com)',
        accept: 'text/html,application/xhtml+xml',
      },
    });

    const html = await upstream.text();
    const title = extractMetaTag(html, 'og:title') || extractTitle(html);
    const description =
      extractMetaTag(html, 'og:description') ||
      extractMetaTag(html, 'description', 'name') ||
      '';
    const image =
      extractMetaTag(html, 'og:image') ||
      extractMetaTag(html, 'twitter:image', 'name') ||
      '';
    const siteName = extractMetaTag(html, 'og:site_name') || targetUrl.hostname.replace(/^www\./, '');
    const faviconHref = extractLinkTag(html, 'icon');

    return response.status(200).json({
      title,
      description,
      image: toAbsoluteUrl(image, targetUrl.toString()),
      siteName,
      favicon: toAbsoluteUrl(faviconHref, targetUrl.toString()),
      url: targetUrl.toString(),
    });
  } catch (error) {
    return response.status(500).json({
      error: 'Unable to fetch preview metadata.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
