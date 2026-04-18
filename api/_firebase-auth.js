async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Firebase API key.');
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid Firebase ID token.');
  }

  const payload = await response.json();
  const user = Array.isArray(payload?.users) ? payload.users[0] : null;

  if (!user?.localId) {
    throw new Error('Unable to resolve Firebase user.');
  }

  return {
    uid: String(user.localId),
    email: String(user.email ?? ''),
  };
}

export async function requireAuthenticatedUser(request, response) {
  const header = request.headers.authorization ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const idToken = match?.[1]?.trim();

  if (!idToken) {
    response.status(401).json({ error: 'Authentication required.' });
    return null;
  }

  try {
    return await verifyFirebaseIdToken(idToken);
  } catch {
    response.status(401).json({ error: 'Invalid authentication token.' });
    return null;
  }
}
