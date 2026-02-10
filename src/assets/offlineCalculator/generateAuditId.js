const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function bytesToBase62(bytes) {
  // treat the bytes as a big integer and convert to base62
  let value = BigInt(0);
  for (let b of bytes) value = (value << BigInt(8)) + BigInt(b);

  let out = "";
  while (value > 0n) {
    out = BASE62[Number(value % 62n)] + out;
    value /= 62n;
  }
  return out || "0";
}

/**
 * generateShortId(length = 10)
 * - length: desired output length in base62 characters (default 10)
 */
export function generateAuditId(length = 10) {
  // compute how many bytes are needed to comfortably cover `length` base62 chars
  // base62^length ≈ 2^(bits) -> bits = length * log2(62) ≈ length * 5.954
  const bitsNeeded = Math.ceil(length * 5.954);
  const bytesNeeded = Math.ceil(bitsNeeded / 8);

  const rnd = new Uint8Array(bytesNeeded);
  crypto.getRandomValues(rnd); // cryptographically secure RNG

  // Convert random bytes to base62 and trim/pad to length
  let id = bytesToBase62(rnd);
  // If too short (rare), append random chars
  while (id.length < length) {
    const idx = crypto.getRandomValues(new Uint8Array(1))[0] % 62;
    id = BASE62[idx] + id;
  }
  return id.slice(-length); // take rightmost characters (uniform enough)
}
