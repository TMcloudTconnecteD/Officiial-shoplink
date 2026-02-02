const apiUrl = import.meta.env.VITE_API_URL || '';

console.log('clerkSync apiUrl=', apiUrl);

export default async function syncClerkUser(userPayload = {}, clerkToken = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (clerkToken) headers['Authorization'] = `Bearer ${clerkToken}`;

    const res = await fetch(`${apiUrl}/api/users/clerk`, {
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
