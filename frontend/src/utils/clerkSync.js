import { BASE_URL } from '../redux/features/constants.js';

export default async function syncClerkUser(userPayload = {}, clerkToken = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (clerkToken) headers['Authorization'] = `Bearer ${clerkToken}`;

    const res = await fetch(`${BASE_URL}/api/users/clerk`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Clerk sync failed');
    }

    const json = await res.json();
    return json;
  } catch (err) {
    console.error('syncClerkUser error', err);
    return null;
  }
}
