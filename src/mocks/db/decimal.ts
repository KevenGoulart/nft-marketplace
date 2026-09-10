const SCALE = 100_000_000n;
const DISPLAY_DECIMALS = 4;

function toMicro(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  const paddedFraction = (fraction + "0".repeat(8)).slice(0, 8);
  return BigInt(whole || "0") * SCALE + BigInt(paddedFraction || "0");
}

function fromMicro(value: bigint): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const whole = abs / SCALE;
  let fraction = (abs % SCALE).toString().padStart(8, "0");
  fraction = fraction.slice(0, DISPLAY_DECIMALS).replace(/0+$/, "");
  const sign = negative ? "-" : "";
  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
}

export function multiplyByInt(ethAmount: string, quantity: number): string {
  return fromMicro(toMicro(ethAmount) * BigInt(quantity));
}

export function sumEth(values: string[]): string {
  return fromMicro(values.reduce((acc, value) => acc + toMicro(value), 0n));
}

export function subtractEth(a: string, b: string): string {
  const result = toMicro(a) - toMicro(b);
  return fromMicro(result < 0n ? 0n : result);
}

export function percentOf(ethAmount: string, percent: number): string {
  const percentMicro = BigInt(Math.round(percent * 1_000_000));
  return fromMicro((toMicro(ethAmount) * percentMicro) / 1_000_000n);
}

export function compareEth(a: string, b: string): number {
  const diff = toMicro(a) - toMicro(b);
  return diff === 0n ? 0 : diff > 0n ? 1 : -1;
}
