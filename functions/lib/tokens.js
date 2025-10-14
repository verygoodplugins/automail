// Lightweight HMAC token utilities for confirm/unsubscribe links
// Works on Cloudflare Workers runtime (Web Crypto API)

const te = new TextEncoder();

async function getKey(secret) {
  const keyData = te.encode(String(secret || ''));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createToken(email, secret, ttlSeconds = 60 * 60 * 24 * 7) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${email}.${exp}`;
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, te.encode(payload));
  const token = `${btoa(payload)}.${toHex(sig)}`;
  return token;
}

export async function verifyToken(token, secret) {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return null;
    const b64 = token.slice(0, lastDot);
    const sigHex = token.slice(lastDot + 1);
    const decoded = atob(b64);
    const [email, expStr] = decoded.split('.')
    if (!email || !expStr) return null;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
    const key = await getKey(secret);
    const expectedSig = await crypto.subtle.sign('HMAC', key, te.encode(`${email}.${exp}`));
    const expectedHex = toHex(expectedSig);
    if (expectedHex !== sigHex) return null;
    return email;
  } catch {
    return null;
  }
}

