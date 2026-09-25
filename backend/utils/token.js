/**
 * Minimal signed-token helper (HMAC-SHA256), so we don't need an external
 * JWT dependency for a demo-scale admin session. Format: base64(payload).signature
 */

const crypto = require("crypto");

const SECRET = process.env.TOKEN_SECRET || "ntc-guest-satisfaction-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function sign(payloadObj) {
  const payload = { ...payloadObj, exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verify(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadB64, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  if (payload.exp < Date.now()) return null;

  return payload;
}

module.exports = { sign, verify };
