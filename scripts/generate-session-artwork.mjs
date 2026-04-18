import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env.local');
const outputDir = path.join(rootDir, 'public', 'session-artworks');

const sharedStylePrompt =
  'Create a wide horizontal editorial illustration for a dark education dashboard canvas. The image should feel warm, soft, human-centered, and beginner-friendly. Avoid robots, humanoid AI characters, cyberpunk motifs, neon overload, and hard sci-fi aesthetics. Use deep navy as the base so it fits a dark UI, with gentle mint, peach, soft sky blue, and muted lavender accents. The mood should be calm, approachable, slightly illustrative, and polished. No text, no letters, no logos, no watermark, no UI chrome labels.';

const sessionPrompts = [
  {
    id: 'session-1',
    prompt:
      'Show a beginner at a desk turning handwritten notes and simple sticky ideas into a clean app screen. Emphasize gentle creative flow, iteration, and clarity. Make it feel like ideas becoming a first digital result.',
  },
  {
    id: 'session-2',
    prompt:
      'Show a friendly mail merge workflow with a spreadsheet on one side and personalized email cards flowing out on the other. Emphasize repetition becoming organized automation. Keep it warm and easy to understand.',
  },
  {
    id: 'session-3',
    prompt:
      'Show a beginner discovering a new AI workspace tool. Use layered panels, notes, cursor movement, and arranged workspace surfaces to suggest exploration of a tool environment, without any robot imagery.',
  },
  {
    id: 'session-4',
    prompt:
      'Show someone actively working inside a creative AI workflow: arranging prompts, checking results, comparing versions, and refining an interface draft. Emphasize practice, confidence, and hands-on learning.',
  },
  {
    id: 'session-5',
    prompt:
      'Show an app screen connected to a gentle cloud-like data system, with cards, profile snippets, and content blocks linked by soft flowing lines. Emphasize that the app now stores and reads real data like a living service.',
  },
  {
    id: 'session-6',
    prompt:
      'Show a welcoming login experience: profile cards, secure entry, friendly access flow, and personalized content sections. Emphasize human-centered authentication and entering a personal learning space.',
  },
  {
    id: 'session-7',
    prompt:
      'Show one application asking another service for information, with request and response flowing between calm interface panels. Emphasize connection, exchange, and outside data coming into a product.',
  },
  {
    id: 'session-8',
    prompt:
      'Show a balanced system where static website assets are delivered smoothly while a small backend function handles secure processing behind the scenes. Use one side for fast content delivery and another for protected service logic, with harmonious connection lines.',
  },
];

function parseEnv(text) {
  const result = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }

  return result;
}

function extractImageBase64(responseJson) {
  const parts = responseJson?.candidates?.flatMap((candidate) => candidate?.content?.parts ?? []) ?? [];
  const imagePart = parts.find((part) => part?.inlineData?.data && String(part?.inlineData?.mimeType ?? '').startsWith('image/'));
  return imagePart?.inlineData?.data ?? null;
}

async function generateImage({ apiKey, model, prompt, outputPath }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${sharedStylePrompt} ${prompt}` }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    const message = json?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  const base64 = extractImageBase64(json);
  if (!base64) {
    throw new Error('응답에서 이미지 데이터를 찾지 못했습니다.');
  }

  await fs.writeFile(outputPath, Buffer.from(base64, 'base64'));
}

async function main() {
  const envText = await fs.readFile(envPath, 'utf8');
  const env = parseEnv(envText);
  const apiKey = env.GOOGLE_GENAI_API_KEY;
  const model = env.GOOGLE_IMAGE_MODEL || 'gemini-2.5-flash-image';

  if (!apiKey) {
    throw new Error('.env.local에 GOOGLE_GENAI_API_KEY가 없습니다.');
  }

  await fs.mkdir(outputDir, { recursive: true });

  console.log(`Using model: ${model}`);

  const requestedIds = process.argv.slice(2);
  const targetSessions =
    requestedIds.length > 0 ? sessionPrompts.filter((session) => requestedIds.includes(session.id)) : sessionPrompts;

  for (const session of targetSessions) {
    const outputPath = path.join(outputDir, `${session.id}.png`);
    try {
      await fs.access(outputPath);
      console.log(`Skipping ${session.id} (already exists)`);
      continue;
    } catch {
      // file does not exist yet
    }

    console.log(`Generating ${session.id}...`);
    await generateImage({
      apiKey,
      model,
      prompt: session.prompt,
      outputPath,
    });
    console.log(`Saved ${outputPath}`);
  }

  console.log('All session artworks generated successfully.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
