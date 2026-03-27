let dbUnavailableUntil = 0;
let lastProbeAt = 0;
let lastProbeReachable = true;

async function probeDatabaseReachability(timeoutMs = 180) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return true;
  }

  let host = "";
  let port = 5432;

  try {
    const parsed = new URL(databaseUrl);
    host = parsed.hostname;
    port = parsed.port ? Number(parsed.port) : 5432;
  } catch {
    return true;
  }

  if (!host) {
    return true;
  }

  const net = await import("node:net");

  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();

    const finalize = (value: boolean) => {
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));

    try {
      socket.connect(port, host);
    } catch {
      finalize(false);
    }
  });
}

export function isDatabaseUnavailableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const prismaCodeCandidate = (error as unknown as { code?: unknown }).code;
  const prismaCode = typeof prismaCodeCandidate === "string" ? prismaCodeCandidate : "";

  return (
    message.includes("can't reach database server") ||
    message.includes("prismaclientinitializationerror") ||
    message.includes("the table") ||
    message.includes("does not exist in the current database") ||
    message.includes("the column") ||
    prismaCode === "P2021" ||
    prismaCode === "P2022"
  );
}

export function markDatabaseUnavailable(durationMs = 45000) {
  dbUnavailableUntil = Date.now() + durationMs;
}

export function shouldSkipDatabase() {
  return Date.now() < dbUnavailableUntil;
}

export async function canAttemptDatabase() {
  if (shouldSkipDatabase()) {
    return false;
  }

  const now = Date.now();

  if (now - lastProbeAt < 10000) {
    return lastProbeReachable;
  }

  lastProbeAt = now;
  lastProbeReachable = await probeDatabaseReachability();

  if (!lastProbeReachable) {
    markDatabaseUnavailable(30000);
  }

  return lastProbeReachable;
}

export function clearDatabaseUnavailable() {
  dbUnavailableUntil = 0;
}
