export function getUUID(uuid: string, n: number) {
  let buf = Buffer.from(uuid);
  buf.writeBigUInt64BE(buf.readBigUInt64BE(27) + BigInt(n));
  return buf.toString();
}
