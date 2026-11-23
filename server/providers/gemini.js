// Google Gemini: text (JSON mode), image generation and editing with reference images.
import { fetchJson } from '../core/http.js';
import { schemaInstruction, parseJson } from './json.js';

export function geminiProvider(env = process.env) {
  const key = env.GEMINI_API_KEY;
  const base = env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const models = { text: env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash', image: env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image' };
  const call = (model, body) => fetchJson(`${base}/models/${model}:generateContent`, {
    provider: 'gemini', method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const firstImage = (body) => {
    const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
    const d = part?.inlineData || part?.inline_data;
    if (!d) throw new Error('gemini: no image in the response');
    return { b64: d.data, mime: d.mimeType || d.mime_type || 'image/png' };
  };

  return {
    id: 'gemini', label: 'Google Gemini', configured: Boolean(key), models,
    tasks: {
      async text({ system, prompt, schema }) {
        const body = await call(models.text, {
          systemInstruction: { parts: [{ text: `${system}\n\n${schemaInstruction(schema)}` }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        });
        const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
        return { data: parseJson(text, schema, 'gemini'), model: models.text, usage: { inputTokens: body.usageMetadata?.promptTokenCount, outputTokens: body.usageMetadata?.candidatesTokenCount } };
      },
      async image({ prompt }) {
        const body = await call(models.image, { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } });
        return { image: firstImage(body), model: models.image, usage: { images: 1 } };
      },
      async edit({ prompt, images }) {
        const parts = [...images.map((img) => ({ inlineData: { mimeType: img.mime || 'image/png', data: img.b64 } })), { text: prompt }];
        const body = await call(models.image, { contents: [{ role: 'user', parts }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } });
        return { image: firstImage(body), model: models.image, usage: { images: 1 } };
      },
    },
  };
}
