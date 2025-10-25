type RuntimeEnv = Record<string, string | undefined>;

export const getRuntimeEnv = (): RuntimeEnv => {
  const bunEnv = (
    globalThis as typeof globalThis & { Bun?: { env: RuntimeEnv } }
  ).Bun?.env;

  if (bunEnv) {
    return bunEnv;
  }

  if (typeof process !== "undefined") {
    return process.env;
  }

  return {};
};

export const runtimeEnv = getRuntimeEnv();

export default runtimeEnv;
