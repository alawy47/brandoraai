// Fast API function: creates jobs and reports status. Reached at /api/* (see netlify.toml).
import { getStore } from '@netlify/blobs';
import { handleApi, blobsAdapter } from '../lib/api.js';

const stores = blobsAdapter(getStore);

export default async (req) => handleApi(req, {
  stores,
  // Hand the job to the background function. It answers 202 at once and keeps running for up to 15 minutes.
  trigger: async (jobId, token) => {
    const res = await fetch(new URL('/.netlify/functions/run-background', req.url), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jobId, token }) });
    if (res.status !== 202 && !res.ok) throw new Error(`Could not start the background job (${res.status}).`);
  },
});
