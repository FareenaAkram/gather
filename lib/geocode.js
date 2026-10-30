// Vercel adds the visitor's rough location (worked out from their IP address) to every
// request as headers. We use it so the address search shows nearby places first,
// without asking for location permission. Returns null locally, where there are no
// such headers.
export function approximateLocation(req) {
  const lat = Number(req.headers['x-vercel-ip-latitude']);
  const lng = Number(req.headers['x-vercel-ip-longitude']);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// Turns an address into map coordinates with OpenStreetMap's free Nominatim service.
// Their usage policy asks for an identifying User-Agent and at most one request per
// second, so we never call this per visitor: each address is looked up once and the
// result is saved with the meetup (see getMeetupLocation in lib/meetups.js).
//
// Returns { lat, lng }, null if the address couldn't be found, or undefined if the
// lookup itself failed (network error, rate limit), so we know to try again later.
export async function geocodeAddress(address) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(address);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'gather-meetups (https://gather-omega-fawn.vercel.app)' },
    });
    if (!response.ok) {
      return undefined;
    }
    const results = await response.json();
    if (results.length === 0) {
      return null;
    }
    return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
  } catch (err) {
    return undefined;
  }
}
