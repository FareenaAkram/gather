import { handleUpload } from '@vercel/blob/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// The browser uploads the image straight to Vercel Blob. This route's only job is to
// hand out a short-lived upload token, and only to signed-in users, with limits on
// file type and size so nobody can use our storage for anything else.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const session = await getServerSession(req, res, authOptions);

  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!session) {
          throw new Error('Please sign in to upload images.');
        }
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true, // two people uploading "photo.jpg" won't overwrite each other
        };
      },
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
