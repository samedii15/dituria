import { NextResponse } from "next/server";

import {
  canAttemptDatabase,
  clearDatabaseUnavailable,
  isDatabaseUnavailableError,
  markDatabaseUnavailable,
  shouldSkipDatabase,
} from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const HEALTH_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checks: {
          database: "missing-config",
        },
      },
      { status: 503, headers: HEALTH_HEADERS },
    );
  }

  if (shouldSkipDatabase() || !(await canAttemptDatabase())) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checks: {
          database: "unreachable",
        },
      },
      { status: 503, headers: HEALTH_HEADERS },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    clearDatabaseUnavailable();

    return NextResponse.json(
      {
        ok: true,
        status: "ok",
        checks: {
          database: "reachable",
        },
      },
      { status: 200, headers: HEALTH_HEADERS },
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      markDatabaseUnavailable();
    }

    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checks: {
          database: "unreachable",
        },
      },
      { status: 503, headers: HEALTH_HEADERS },
    );
  }
}
