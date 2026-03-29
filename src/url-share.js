// URL hash sharing — compress editor code into a shareable #code=… fragment.

function base64urlEncode(uint8) {
  let bin = '';
  for (const b of uint8) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - str.length % 4) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function streamToUint8Array(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}

export async function updateHash(code) {
  const encoded = new TextEncoder().encode(code);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(encoded);
  writer.close();
  const compressed = await streamToUint8Array(cs.readable);
  const hash = '#code=' + base64urlEncode(compressed);
  history.replaceState(null, '', hash);
}

export async function decodeFromHash() {
  const hash = location.hash;
  if (!hash.startsWith('#code=')) return null;
  try {
    // Messaging apps (KakaoTalk, Slack, iMessage, etc.) mangle URLs via
    // "smart" typography: "--" → em dash, inserted zero-width chars, etc.
    // None of these are valid base64url, so strip/replace them safely.
    const payload = decodeURIComponent(hash.slice(6))
      .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '')       // zero-width / soft-hyphen
      .replace(/[\u2014\u2015\uFE58]/g, '--')                  // em dash variants → --
      .replace(/[\u2010-\u2013\u2212\uFE63\uFF0D]/g, '-');     // en dash / minus variants → -
    const compressed = base64urlDecode(payload);
    if (compressed.length > 100_000) return null;
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(compressed);
    writer.close();
    const decompressed = await streamToUint8Array(ds.readable);
    if (decompressed.length > 1_000_000) return null;
    return new TextDecoder().decode(decompressed);
  } catch {
    return null;
  }
}
