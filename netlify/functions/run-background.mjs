// Background function (the "-background" suffix gives it a 15 minute limit). Runs one AI job.
// It only does work for a job id plus the job's own secret token, which only the API function knows.
import { getStore } from '@netlify/blobs';
import { runJob, blobsAdapter } from '../lib/api.js';

const stores = blobsAdapter(getStore);

export default async (req) => {
  const body = await req.json().catch(() => ({}));
  await runJob(body, { stores });
};
