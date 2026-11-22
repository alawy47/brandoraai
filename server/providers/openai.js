// OpenAI: text (JSON mode), image generation and image editing with reference images.
// Model names are configurable because they change; set them to the models on your account.
import { fetchJson } from '../core/http.js';
import { schemaInstruction, parseJson } from './json.js';

export function openaiProvider(env = process.env) {
  const key = env.OPENAI_API_KEY;
  const base = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const models = { text: env.OPENAI_TEXT_MODEL || 'gpt-4.1', image: env.OPENAI_IMAGE_MODEL || 'gpt-image-1' };
  const auth = { Authorization: `Bearer ${key}` };

  return {
    id: 'openai', label: 'OpenAI', configured: Boolean(key), models,
    tasks: {
      async text({ system, prompt, schema, maxTokens = 16000 }) {
        const body = await fetchJson(`${base}/chat/completions`, {
          provider: 'openai', method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: models.text, max_tokens: maxTokens, response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: `${system}\n\n${schemaInstruction(schema)}` }, { role: 'user', content: prompt }],
          }),
        });
        return { data: parseJson(body.choices?.[0]?.message?.content, schema, 'openai'), model: body.model, usage: { inputTokens: body.usage?.prompt_tokens, outputTokens: body.usage?.completion_tokens } };
      },
      async image({ prompt, size = '1024x1024', transparent = false }) {
        const body = await fetchJson(`${base}/images/generations`, {
          provider: 'openai', method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: models.image, prompt, size, n: 1, ...(transparent ? { background: 'transparent' } : {}) }),
        });
        const b64 = body.data?.[0]?.b64_json;
        if (!b64) throw new Error('openai: no image in the response');
        return { image: { b64, mime: 'image/png' }, model: models.image, usage: { images: 1 } };
      },
      async edit({ prompt, images, size = '1024x1024' }) {
        const form = new FormData();
        form.append('model', models.image);
        form.append('prompt', prompt);
        form.append('size', size);
        images.forEach((img, i) => form.append('image[]', new Blob([Buffer.from(img.b64, 'base64')], { type: img.mime || 'image/png' }), `ref-${i}.png`));
        const body = await fetchJson(`${base}/images/edits`, { provider: 'openai', method: 'POST', headers: auth, body: form });
        const b64 = body.data?.[0]?.b64_json;
        if (!b64) throw new Error('openai: no image in the response');
        return { image: { b64, mime: 'image/png' }, model: models.image, usage: { images: 1 } };
      },
    },
  };
}
