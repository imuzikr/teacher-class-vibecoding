import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { requireAuthenticatedUser } from './_firebase-auth.js';

export const config = {
  maxDuration: 60,
};

function toDataUrl(buffer) {
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function wait(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
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

  let browser;

  try {
    const executablePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars'],
      defaultViewport: {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
      },
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    });
    await page.goto(targetUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await wait(1800);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await wait(300);

    const imageBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 72,
      fullPage: false,
      optimizeForSpeed: true,
    });

    return response.status(200).json({
      imageDataUrl: toDataUrl(imageBuffer),
      capturedUrl: page.url(),
    });
  } catch (error) {
    return response.status(500).json({
      error: 'Unable to capture thumbnail.',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
