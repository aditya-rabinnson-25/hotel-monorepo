export function randomString(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const cryptoObj = (typeof globalThis !== "undefined" && (globalThis as any).crypto) || undefined;

if (!cryptoObj || typeof cryptoObj.getRandomValues !== "function") {
  throw new Error("Crypto.getRandomValues not available in this environment");
}
  const randomValues = new Uint8Array(length);
  cryptoObj.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) result += chars[randomValues[i] % chars.length];
  return result;
}

async function sha256(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

function base64UrlEncode(arrayBuffer: Uint8Array) {
  let str = "";
  const len = arrayBuffer.byteLength;
  for (let i = 0; i < len; i++) str += String.fromCharCode(arrayBuffer[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function buildPkce() {
  const verifier = randomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  return { verifier, challenge };
}
